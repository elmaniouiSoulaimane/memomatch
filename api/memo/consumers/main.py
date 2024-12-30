import json
import os

import bcrypt

from time import time
from dotenv import load_dotenv
import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer
load_dotenv()

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.group_name = None
        self.redis_client = None

    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['room_name']
        action = self.scope['url_route']['kwargs']['action']

        # Initialize Redis client
        # self.redis_client = await aioredis.from_url('redis://localhost', encoding="utf-8", decode_responses=True)
        self.redis_client = await redis.from_url(os.getenv('LOCAL_REDIS'), encoding="utf-8", decode_responses=True)

        # Check if the room/group exists
        group_exists = await self.group_exists()

        # Check if the user is already in the room/group
        in_group = await self.is_user_in_group()

        # if there are no channels in the group, and the action is 'create', add the channel to the group,
        # (this means that the room was never created before)
        if action == "create":
            if not group_exists:
                await self.add_user_to_group()
                print('Room "%s" created' % self.group_name)
                await self.accept()
            else:
                print('Room "%s" already exists' % self.group_name)
                if in_group:
                    # TODO: send a message to the client that he's already in the room
                    # TODO: redirect him to the room
                    # TODO: fetch his name
                    # TODO: fetch his all messages
                    print('you\'re already in the group "%s", welcome back' % self.group_name)
                    await self.accept()
                    await self.send(text_data=json.dumps({
                        "success": {
                            "type": "joined-room",
                            "message": 'you\'re already in the group "%s", welcome back' % self.group_name
                        }
                    }))
                else:
                    print("Access denied, key required")

                    await self.accept()
                    await self.send(text_data=json.dumps({
                        "error": {
                            "type": "access-denied",
                            "message": "Access denied, room already exists and you're not a member"
                        }
                    }))
                    await self.close()

        # TODO: user must provide a passkey to join a room
        elif action == "join":
            if not group_exists:
                print('Room "%s" does not exist' % self.group_name)
                await self.accept()
                await self.send(text_data=json.dumps({
                    "error": {
                        "type": "room-does-not-exist",
                        "message": 'Room "%s" does not exist' % self.group_name
                    }
                }))
                await self.close()

            elif group_exists:
                if in_group:
                    # TODO: send a message to the client that he's already in the room
                    # TODO: redirect him to the room
                    # TODO: fetch his name
                    # TODO: fetch his all messages
                    print('you\'re already in the "%s" group, welcome back' % self.group_name)
                    await self.accept()
                    await self.send(text_data=json.dumps({
                        "success": 'you\'re already in the "%s" group, welcome back' % self.group_name
                    }))
                else:
                    print("Access denied, key required")
                    # await self.close()
                    # I accept because he chose join and for now there's no mechanism that checks for a passkey
                    await self.add_user_to_group()
                    await self.accept()

    async def receive(self, text_data:json =None, bytes_data=None):
        """
        Receives data from the client and processes it based on the event type.

        Args:
            text_data (str, optional): The text data received from the client. Defaults to None.
            bytes_data (bytes, optional): The binary data received from the client. Defaults to None.

        Returns:
            None

        Raises:
            None

        Notes:
            - This function expects the received data to be in JSON format.
            - If the event type is "player-joined":
                - It checks if the message is a duplicate by calling the `is_duplicate_message` method.
                - If the message is not a duplicate, it saves the player event by calling the `save_player_event` method.
                - It then sends all room messages by calling the `send_all_room_messages` method.
            - If the event type is "player-moved":
                - It saves the player event by calling the `save_player_event` method.
        """
        print(
            "--------------------------------------------------------------------------------------------------------")
        print("In receive")

        if text_data:
            data_dict = json.loads(text_data)
            event = data_dict['event']
            print("Event: %s" % event)

            if event == "authenticate":
                step = data_dict['step']
                password = data_dict['password']

                await self.authenticate(step, password)

            if event == "player-joined":
                is_duplicate_msg = await self.is_duplicate_message(text_data)
                print("Duplicate message: %s" % is_duplicate_msg)

                if not is_duplicate_msg:
                    status = await self.save_player_event("player-joined", text_data, data_dict)

                    if status:
                        await self.send(text_data=json.dumps({
                            "success": {
                                "type": "player-joined",
                                "message": 'Joined room "%s"' % self.group_name
                            }
                        }))
                        await self.send_all_room_messages()

            if event == "player-moved":
                await self.save_player_event(event, text_data, data_dict)

            if event == "player-quit":
                await self.save_player_event(event, text_data, data_dict)

            if event == "player-won":
                await self.save_player_event(event, text_data, data_dict)


        else:
            print("No text data received")

    async def disconnect(self, close_code):
        await self.remove_user_from_group()
        # Close Redis connection
        await self.redis_client.close()

    async def authenticate(self, step: str, provided_password: str) -> None:
        """Authenticate the user"""
        if step == "create":
            hashed_password = bcrypt.hashpw(provided_password.encode('utf-8'), bcrypt.gensalt())
            await self.redis_client.set(f'room:{self.group_name}:password', hashed_password)
            await self.send(text_data=json.dumps({
                "success": {
                        "type": "room-created",
                        "message": 'Room "%s" created successfully' % self.group_name
                }
            }))
        if step == "join":
            stored_hashed_password = await self.redis_client.get(f'room:{self.group_name}:password')
            if bcrypt.checkpw(provided_password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
                await self.send(text_data=json.dumps({
                    "success": {
                        "type": "joined-room",
                        "message": "Joined room %s" % self.group_name
                    }
                }))
            else:
                await self.send(text_data=json.dumps({
                    "error": {
                        "message": "Invalid password"
                    }
                }))

    # ADD OPERATIONS
    async def store_message_in_redis(self, event: str, data: json, data_dict: dict=None) -> bool:
        """
        Store the given text data in Redis for the specified room.

        Parameters:
            room_name (str): The name of the room.
            text_data (str): The text data to be stored.

        Returns:
            None
        """

        # Using time so that I can sort messages by timestamp
        timestamp = time()

        if event == "player-joined":

            user_exists = await self.username_exists(data_dict['player']['user_name'])

            if not user_exists:
                print("""User %s doesn't exist""" % data_dict['player']['user_name'])
                print("Storing message in Redis")
                await self.redis_client.zadd(self.group_name, {f'{self.channel_name}:{data}': timestamp})

                return True
            else:
                print("""User %s exists""" % data_dict['player']['user_name'])
                print("Please use a unique username")
                await self.send(text_data=json.dumps({
                    "error": {
                        "message": "User with name %s already exists" % data_dict['player']['user_name']
                    }
                }))
                return False

        elif event == "player-moved" or event == "player-won":
            print("Storing message in Redis")
            await self.redis_client.zadd(self.group_name, {f'{self.channel_name}:{data}': timestamp})

            return True

    async def save_player_event(self, event: str, data: json, data_dict: dict= None) -> bool:
        """
        Save the player event by storing the message in Redis, parsing the text data to JSON, and sending a group message with the JSON data.

        Parameters:
            room_name (str): The name of the room where the event occurred.
            text_data (str): The text data containing information about the event.
        """
        status = await self.store_message_in_redis(event, data, data_dict)

        # TODO: seperate the following code into a separate function
        print (f"status: {status}")
        if status:
            await self.channel_layer.group_send(
                self.group_name, {"type": "news.broadcast", "message": data_dict}
            )

            print("message sent successfully")

        return status

    async def add_user_to_group(self):
        print("Adding user to group %s" % self.group_name)
        print(f"channel name: {self.channel_name}")
        await self.redis_client.sadd(f"{self.group_name}:members", self.channel_name)
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        print("User added to group %s" % self.group_name)

    # ------------------------------------------------------------------------------------------------------------------
    # DELETE OPERATIONS
    async def remove_user_from_group(self):
        await self.redis_client.srem(f"{self.group_name}:members", self.channel_name)

        # Step 1: Retrieve all elements from the sorted set
        elements = await self.redis_client.zrange(self.group_name, 0, -1)

        # Step 2: Identify the elements that belong to the specific channel_name
        for element in elements:
            if element.startswith(f'{self.channel_name}:'):
                # Step 3: Remove the element from the sorted set
                await self.redis_client.zrem(self.group_name, element)

        # Remove the channel from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"Channel {self.channel_name} removed from group {self.group_name}")

    # ------------------------------------------------------------------------------------------------------------------
    # CHECK OPERATIONS
    async def group_exists(self) -> bool:
        result = await self.redis_client.exists(self.group_name)
        if result:
            print("Room %s exists" % self.group_name)
            return True
        else:
            print("Room %s does not exist" % self.group_name)
            return False

    async def is_user_in_group(self):
        result = await self.redis_client.sismember(f"{self.group_name}:members", self.channel_name)
        print(f"channel name: {self.channel_name}")
        if result:
            print("User is in group %s" % self.group_name)
            return True
        else:
            print("""User is not in group %s""" % self.group_name)
            return False

    async def username_exists(self, username: str) -> bool:
        # Get all members of the sorted set
        elements = await self.redis_client.zrange(self.group_name, 0, -1)

        # Iterate through the members to check if the username exists
        for element in elements:
            channel, data = element.split(':', 1)
            data_dict = json.loads(data)
            print("=====> member: %s" % data_dict['player']['user_name'])
            print("=====> against username: %s" % username)
            if data_dict['player']['user_name'] == username:
                return True
        return False

    async def is_duplicate_message(self, data: json) -> bool:
        """
        Check if a message is a duplicate by checking if it exists in the Redis set for the given room.

        Parameters:
            room_name (str): The name of the room.
            text_data (str): The message to check for duplication.

        Returns:
            bool: True if the message is a duplicate, False otherwise.
        """
        result = await self.redis_client.zscore(self.channel_name, data)
        if result:
            print("Message is a duplicate")
            return True
        else:
            print("Message is not a duplicate")
            return False

    # ------------------------------------------------------------------------------------------------------------------
    # SEND OPERATIONS
    async def news_broadcast(self, event: dict):
        await self.send(text_data=json.dumps(event))

    async def send_all_room_messages(self):
        """
        Send all room messages to the specified room by retrieving messages from Redis,
        decoding them from utf-8, handling decoding errors, and then sending the messages
        as part of a 'player-catch-up' event.

        Parameters:
            room_name (str): The name of the room to send messages to.

        Returns:
            None
        """
        print("""Sending all room messages to room %s""" % self.group_name)
        all_messages = await self.redis_client.zrange(self.group_name, 0, -1)
        valid_messages = []

        for message in all_messages:
            if message.strip():  # Check if the message is not empty or just whitespace
                try:
                    # Split the message into channel and data
                    _, data = message.split(':', 1)  # Extract only the 'data' part

                    print(f"====> message: {data}")
                    print(f"====> type of message: {type(data)}")
                    valid_messages.append(json.loads(data))  # Append data (already JSON) directly

                except ValueError as e:
                    print(f"Error splitting message: {e}, message: {message}")

            else:
                print("Empty message encountered, skipping.")

        # Prepare the message to broadcast to the room
        message = {
            "event": "player-catch-up",
            "all_messages": valid_messages  # Data already in JSON format
        }

        try:
            await self.channel_layer.group_send(
                self.group_name, {"type": "news.broadcast", "message": message}
            )
        except Exception as e:
            print(f"Error sending message: {e}")
