import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { roomManager } from '../models/room';
import redis from '../redisClient';

const kafka = new Kafka({
  clientId: 'collab-chat-consumer',
  brokers: ['kafka:9092'],
});

const consumer: Consumer = kafka.consumer({ groupId: 'collab-chat-group' });

const usersToSocketsKey = 'usersToSockets';

export async function connectChatConsumer(io: any): Promise<void> {
  await consumer.connect();
  console.log('Chat consumer connected');
  await consumer.subscribe({ topic: 'collab-chat', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      if (topic !== 'collab-chat') return;

      const username = message.key?.toString()!;
      const chatMessage: string = message.value?.toString()!;

      const roomId = await roomManager.getRoomId(username);
      if (!roomId) {
        console.log('User not in a room');
        return;
      }

      const otherUser = await roomManager.getOtherUser(username);
      const otherUserSocketId = await redis.hget(usersToSocketsKey, otherUser);

      // Send the chat message to the other user
      if (otherUserSocketId) {
        console.log(`Chat message from ${username} to ${otherUser}: ${chatMessage}`);
        io.to(otherUserSocketId).emit('chat-message', {
          sender: username,
          message: chatMessage,
        });
      }
    },
  });
}