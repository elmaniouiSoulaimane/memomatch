import json
import random
import redis
import hashlib

from asgiref.sync import async_to_sync

from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer


async def are_identical(flipped_cards):
    first_card = flipped_cards[0]['name']
    second_card = flipped_cards[1]['name']

    if first_card == second_card:
        return True
    else:
        return False


class GameConsumer(WebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def news_broadcast(self, event):
        message = event["message"]
        self.send(text_data=json.dumps({"message": message}))

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"memory_match_{self.room_name}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        room_name = self.scope['url_route']['kwargs']['room_name']
        json_data = json.loads(text_data)
        event = json_data['event']

        if event == "player-joined":
            if not self.is_duplicate_message(room_name, text_data):
                self.save_player_event(room_name, text_data)

            self.send_all_room_messages(room_name)

        if event == "player-moved":
            self.save_player_event(room_name, text_data)

    # BASIC PROTOCOL FOR ALL PLAYER EVENTS (ADD, MOVE, QUIT)
    # STORE MESSAGE
    # UPDATE ROOM MEMBERS
    def save_player_event(self, room_name, text_data):
        self.store_message_in_redis(room_name, text_data)

        json_data = json.loads(text_data)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "news.broadcast", "message": json_data}
        )

    def is_duplicate_message(self, room_name, text_data):
        redis_key = f'{room_name}_messages'
        return self.redis_client.sismember(redis_key, text_data)

    def store_message_in_redis(self, room_name, text_data):
        redis_key = f'{room_name}_messages'
        self.redis_client.sadd(redis_key, text_data)

    def send_all_room_messages(self, room_name):
        redis_key = f'{room_name}_messages'
        all_messages = self.redis_client.smembers(redis_key)

        try:
            all_messages = [json.loads(message.decode('utf-8')) for message in all_messages]
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            # Handle JSON decoding or Unicode decoding errors
            print(f"Error decoding message: {e}")
            all_messages = []

        message = {
            "event": "player-catch-up",
            "all_messages": all_messages
        }

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "news.broadcast", "message": message}
        )

    # async def handle_move(self, data):
    #     flipped_cards = data.get('flipped_cards')
    #
    #     if not flipped_cards or len(flipped_cards) != 2:
    #         if are_identical(flipped_cards):
    #             user_name = data.get('user_name')
    #
    #             try:
    #                 user = User.objects.get(user_name=user_name)
    #                 user.points += random.randint(5, 40)
    #                 user.save()
    #
    #                 await self.broadcast_game_state(flipped_cards, user.points)
    #
    #             except User.DoesNotExist:
    #                 # Handle the case where the user does not exist in the database
    #                 pass
    #
    #     pass
