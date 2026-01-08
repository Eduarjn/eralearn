import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import cors from "cors"

// Criar diretório de vídeos se não existir
const videoDir = "/opt/eralearn/pana-learn/videos/"
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true })
}

// Configuração para salvar arquivos na pasta de vídeos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/opt/eralearn/pana-learn/videos/")
    },
    filename: (req, file, cb) => {
        // Mantém nome original com timestamp para evitar conflitos
        const timestamp = Date.now()
        const originalName = file.originalname
        cb(null, `${timestamp}-${originalName}`)
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limite
    },
    fileFilter: (req, file, cb) => {
        // Aceita apenas vídeos
        if (file.mimetype.startsWith("video/")) {
            cb(null, true)
        } else {
            cb(new Error("Apenas arquivos de vídeo são permitidos!"), false)
        }
    },
})

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Endpoint para upload de vídeo
app.post("/api/videos/upload-local", upload.single("video"), (req, res) => {
    try {
        const { curso, titulo, descricao, duracao, categoria } = req.body

        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo de vídeo enviado" })
        }

        console.log("✅ Novo vídeo importado:", {
            curso,
            titulo,
            descricao,
            duracao,
            categoria,
            arquivo: req.file.filename,
            tamanho: req.file.size,
            caminho: req.file.path,
        })

        res.json({
            message: "Vídeo importado com sucesso!",
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                path: req.file.path,
            },
            metadata: {
                curso,
                titulo,
                descricao,
                duracao,
                categoria,
            },
        })
    } catch (error) {
        console.error("❌ Erro no upload:", error)
        res.status(500).json({ error: "Erro interno do servidor" })
    }
})

// Endpoint para listar vídeos
app.get("/api/videos/list", (req, res) => {
    try {
        const files = fs.readdirSync(videoDir)
        const videoFiles = files.filter(
            (file) => file.endsWith(".mp4") || file.endsWith(".avi") || file.endsWith(".mov") || file.endsWith(".mkv"),
        )

        const videoList = videoFiles.map((file) => {
            const filePath = path.join(videoDir, file)
            const stats = fs.statSync(filePath)

            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
            }
        })

        res.json({ videos: videoList })
    } catch (error) {
        console.error("❌ Erro ao listar vídeos:", error)
        res.status(500).json({ error: "Erro ao listar vídeos" })
    }
})

// Endpoint de health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        videoDir: videoDir,
        server: "Pana-Learn Video Upload Server",
    })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor de upload rodando na porta ${PORT}`)
    console.log(`📁 Diretório de vídeos: ${videoDir}`)
    console.log(`🌐 Acesso externo: http://138.59.144.162:${PORT}`)
})
