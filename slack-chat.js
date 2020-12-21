const { WebClient } = require('@slack/web-api');

// Read a token from the environment variables
// const token = "xoxp-69753451537-973728075779-1585639265202-a2f1402e6a167ea2bc3197c87ef4bdde";
const token = "xoxb-69753451537-1589161877795-cNvXeaMWhuHLnNjWGtDV2YSS";

// Initialize
const web = new WebClient(token);

// const conversationId = 'GGE3NAENR';
// const conversationId = 'DUP30DHJ5';
const conversationId = 'G01HPH3Q1ND';

(async () => {

  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const result = await web.chat.postMessage({
    text: '<@UUMME27NX>　おはようございます。本日の業務を開始いたします。',
    link_names: true,
    channel: conversationId,
  });

  // The result contains an identifier for the message, `ts`.
  console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
})();
