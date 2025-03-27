const express = require('express');
   const ytdl = require('ytdl-core');
   const ffmpeg = require('fluent-ffmpeg');
   const fs = require('fs');
   const cors = require('cors');

   const app = express();
   app.use(cors());
   const PORT = process.env.PORT || 3000;

   if (!fs.existsSync('temp')) fs.mkdirSync('temp');

   app.get('/convert', async (req, res) => {
       const { url } = req.query;

       if (!url || !ytdl.validateURL(url)) {
           return res.status(400).json({ error: 'URL inválida! Exemplo: ?url=https://youtube.com/watch?v=...' });
       }

       try {
           const videoId = new URL(url).searchParams.get('v');
           const outputPath = `temp/${videoId}.mp3`;

           const audioStream = ytdl(url, { quality: 'highestaudio' });
           ffmpeg(audioStream)
               .audioBitrate(128)
               .save(outputPath)
               .on('end', () => {
                   res.download(outputPath, `audio_${videoId}.mp3`, () => {
                       fs.unlinkSync(outputPath);
                   });
               });
       } catch (error) {
           res.status(500).json({ error: 'Erro ao converter. Tente outro vídeo.' });
       }
   });

   app.listen(PORT, () => {
       console.log(`API rodando na porta ${PORT}`);
   });
