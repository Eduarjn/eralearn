import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    const dataDir = process.env.CERT_DATA_DIR || './data';
    const indexPath = path.join(dataDir, 'manifests', 'index.jsonl');
    
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      const allCertificates = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      // Filtrar certificados do usuário (por enquanto, retornar todos)
      // Em uma implementação real, você associaria certificados a usuários
      const userCertificates = allCertificates.filter(cert => {
        // Por enquanto, retornar todos os certificados
        // Você pode implementar lógica específica aqui
        return true;
      });
      
      return NextResponse.json({
        certificates: userCertificates,
        total: userCertificates.length
      });
    } catch (error) {
      // Arquivo não existe ou está vazio
      return NextResponse.json({
        certificates: [],
        total: 0
      });
    }
    
  } catch (error) {
    console.error('Erro ao buscar certificados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}





