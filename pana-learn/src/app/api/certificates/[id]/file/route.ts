import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getFilesPath } from '@/utils/certificateUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'svg';
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do certificado é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!['svg', 'png', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use: svg, png ou pdf' },
        { status: 400 }
      );
    }
    
    // Buscar arquivo em todas as pastas de data
    const dataDir = process.env.CERT_DATA_DIR || './data';
    const filesDir = path.join(dataDir, 'files');
    
    // Procurar em todas as subpastas YYYY/MM/ID
    const years = await fs.readdir(filesDir).catch(() => []);
    
    for (const year of years) {
      if (year.match(/^\d{4}$/)) {
        const yearPath = path.join(filesDir, year);
        const months = await fs.readdir(yearPath).catch(() => []);
        
        for (const month of months) {
          if (month.match(/^\d{2}$/)) {
            const monthPath = path.join(yearPath, month);
            const ids = await fs.readdir(monthPath).catch(() => []);
            
            if (ids.includes(id)) {
              const filePath = path.join(monthPath, id, `certificate.${format}`);
              
              try {
                const fileBuffer = await fs.readFile(filePath);
                
                // Definir Content-Type baseado no formato
                const contentType = {
                  svg: 'image/svg+xml',
                  png: 'image/png',
                  pdf: 'application/pdf'
                }[format] || 'application/octet-stream';
                
                return new NextResponse(fileBuffer, {
                  headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="certificate-${id}.${format}"`,
                    'Cache-Control': 'public, max-age=31536000' // Cache por 1 ano
                  }
                });
              } catch {
                // Arquivo não encontrado, continuar procurando
                continue;
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Arquivo não encontrado' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Erro ao buscar arquivo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}





