import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { extractTokensFromSvg, TEMPLATE_MAPPING } from '@/utils/certificateUtils';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'certificates');
    const templates: Array<{
      key: string;
      name: string;
      fileName: string;
      tokens: string[];
      dimensions: { width: number; height: number; unit: string };
    }> = [];
    
    // Verificar se o diretório de templates existe
    try {
      await fs.access(templatesDir);
    } catch {
      return NextResponse.json(
        { error: 'Diretório de templates não encontrado' },
        { status: 404 }
      );
    }
    
    // Processar cada template
    for (const [key, fileName] of Object.entries(TEMPLATE_MAPPING)) {
      const filePath = path.join(templatesDir, fileName);
      
      try {
        const svgContent = await fs.readFile(filePath, 'utf8');
        const tokens = extractTokensFromSvg(svgContent);
        
        // Extrair dimensões
        const widthMatch = svgContent.match(/width="([^"]+)"/);
        const heightMatch = svgContent.match(/height="([^"]+)"/);
        
        const width = widthMatch ? parseFloat(widthMatch[1]) : 800;
        const height = heightMatch ? parseFloat(heightMatch[1]) : 600;
        
        templates.push({
          key,
          name: fileName.replace('.svg', ''),
          fileName,
          tokens,
          dimensions: { width, height, unit: 'px' }
        });
      } catch (error) {
        console.error(`Erro ao processar template ${fileName}:`, error);
        // Continuar com outros templates
      }
    }
    
    return NextResponse.json({
      templates,
      total: templates.length
    });
    
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}





