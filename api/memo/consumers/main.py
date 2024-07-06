import json
import urllib
from time import time

import aioredis
from channels.generic.websocket import AsyncWebsocketConsumer


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['room_name']
        # Decode query string from bytes to UTF-8 string
        query_string = self.scope['query_string'].decode('utf-8')

        # Parse query string into a dictionary
        query_params = urllib.parse.parse_qs(query_string)

        # Access individual query parameters
        action = query_params.get('action', [''])[0]

        # Initialize Redis client
        self.redis_client = await aioredis.from_url('redis://localhost', encoding="utf-8", decode_responses=True)

        # Check if the user is already in the group
        in_group = await self.is_user_in_group(self.group_name, self.channel_name)

        # if there are no channels in the group, and the action is 'create', add the channel to the group,
        # (this means that the room was never created before)
        if action == "create":
            if not in_group:
                await self.add_user_to_group(self.group_name, self.channel_name)
                print("Room %s created" % self.group_name)
                print("You're added to group %s" % self.group_name)
                await self.accept()
            else:
                print("Room %s already exists" % self.group_name)
                print("You're already part of the room %s" % self.group_name)
                await self.accept()

        # if a user tries to create a room that already exists, reject the connection if he's not already in it

        # TODO: user must provide a passkey to join a room
        elif action == "join":
            if in_group:
                # TODO: send a message to the client that he's already in the room
                # TODO: redirect him to the room
                # TODO: fetch his name
                # TODO: fetch his all messages
                print("you're already in the group %s, welcome back" % self.group_name)
                await self.accept()
            else:
                print("Access denied, key required")
                await self.close()

            # self.send_all_room_messages(room_name)

    async def is_user_in_group(self, group_name, channel_name):
        reuslt = await self.redis_client.sismember(f"group:{group_name}", channel_name)
        if reuslt:
            print("User is in group %s" % group_name)
            return True
        else:
            print("""User is not in group %s""" % group_name)
            return False

    async def add_user_to_group(self, group_name, channel_name):
        print("Adding user to group %s" % group_name)
        await self.redis_client.sadd(f"group:{group_name}", channel_name)
        await self.channel_layer.group_add(
            group_name,
            channel_name
        )
        print("User added to group %s" % group_name)
        # await self.send_all_room_messages(group_name)

    async def receive(self, text_data):
        """
        Processes the received text data to handle player events based on the event type.

        Parameters:
            text_data (str): The text data received by the WebSocket connection.

        Returns:
            None
        """
        print("In receive")
        room_name = self.scope['url_route']['kwargs']['room_name']
        json_data = json.loads(text_data)
        event = json_data['event']

        if event == "player-joined":
            is_duplicate_msg = await self.is_duplicate_message(room_name, text_data)
            print("Duplicate message: %s" % is_duplicate_msg)
            if not is_duplicate_msg:
                await self.save_player_event(room_name, text_data)

            await self.send_all_room_messages(room_name)

        if event == "player-moved":
            await self.save_player_event(room_name, text_data)

    async def is_duplicate_message(self, room_name, text_data):
        """
        Check if a message is a duplicate by checking if it exists in the Redis set for the given room.

        Parameters:
            room_name (str): The name of the room.
            text_data (str): The message to check for duplication.

        Returns:
            bool: True if the message is a duplicate, False otherwise.
        """
        redis_key = f'{room_name}_messages'
        result = await self.redis_client.zscore(redis_key, text_data)

        return result

    async def save_player_event(self, room_name, text_data):
        """
        Save the player event by storing the message in Redis, parsing the text data to JSON, and sending a group message with the JSON data.

        Parameters:
            room_name (str): The name of the room where the event occurred.
            text_data (str): The text data containing information about the event.
        """
        await self.store_message_in_redis(room_name, text_data)

        json_data = json.loads(text_data)

        await self.channel_layer.group_send(
            room_name, {"type": "news.broadcast", "message": json_data}
        )

    async def disconnect(self, close_code):
        await self.remove_user_from_group(self.group_name, self.channel_name)
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"Channel {self.channel_name} removed from group {self.group_name}")

    async def remove_user_from_group(self, group_name, channel_name):
        await self.redis_client.srem(f"group:{group_name}", channel_name)

    async def news_broadcast(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps({"message": message}))

    async def store_message_in_redis(self, room_name, text_data):
        """
        Store the given text data in Redis for the specified room.

        Parameters:
            room_name (str): The name of the room.
            text_data (str): The text data to be stored.

        Returns:
            None
        """
        redis_key = f'{room_name}_messages'
        timestamp = time()
        await self.redis_client.zadd(redis_key, {text_data: timestamp})

    async def send_all_room_messages(self, room_name):
        """
        Send all room messages to the specified room by retrieving messages from Redis,
        decoding them from utf-8, handling decoding errors, and then sending the messages
        as part of a 'player-catch-up' event.

        Parameters:
            room_name (str): The name of the room to send messages to.

        Returns:
            None
        """
        print("""Sending all room messages to room %s""" % room_name)
        redis_key = f'{room_name}_messages'
        all_messages = await self.redis_client.zrange(redis_key, 0, -1)

        try:
            all_messages = [json.loads(message) for message in all_messages]
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            # Handle JSON decoding or Unicode decoding errors
            print(f"Error decoding message: {e}")
            all_messages = []

        message = {
            "event": "player-catch-up",
            "all_messages": all_messages
        }

        print(f"Sending message: {message}")
        try:
            await self.channel_layer.group_send(
                room_name, {"type": "news.broadcast", "message": message}
            )
        except Exception as e:
            print(f"Error sending message: {e}")
