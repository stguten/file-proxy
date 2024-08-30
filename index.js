import express from 'express';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('Nenhum arquivo foi enviado.');
        
        const file = req.file;
        const filePath = path.join(process.cwd(), req.file.path);
        const fileContent = fs.createReadStream(filePath);

        await axios.put(`https://pixeldrain.com/api/file/${file.originalname}`, fileContent, {
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.PIXEL_TOKEN).toString('base64')}`, // Para obter os cabeçalhos corretos de 'multipart/form-data'
            }
        }).then((response) => {
            return res.status(200).send(response.data);
        }).catch((error) => {
            return res.status(500).send('Erro no upload');
        }).finally(() => {
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        return res.status(500).send('Erro ao fazer upload para o servidor remoto.');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});