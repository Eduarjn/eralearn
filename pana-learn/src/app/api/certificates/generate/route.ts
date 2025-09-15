import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { 
  ensureDirectoryExists,
  writeJsonAtomic,
  appendJsonlAtomic,
  acquireLock,
  releaseLock,
  calculateSha256,
  extractTokensFromSvg,
  replaceTokensInSvg,
  getTemplatePath,
  getManifestPath,
  getFilesPath,
  getIndexPath,
  generateCertificateId,
  extractSvgDimensions,
  extractSvgFonts,
  certificateExists,
  validateTemplateKey,
  validateTokens,
  validateFormat,
  type TemplateKey,
  type CertificateTokens,
  type CertificateManifest,
  type CertificateIndexEntry
} from '@/utils/certificateUtils';

interface GenerateRequest {
  templateKey: string;
  format: 'svg' | 'png' | 'pdf';
  tokens: CertificateTokens;
  overwrite?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    // Validações básicas
    if (!validateTemplateKey(body.templateKey)) {
      return NextResponse.json(
        { error: `Template inválido: ${body.templateKey}` },
        { status: 400 }
      );
    }
    
    if (!validateFormat(body.format)) {
      return NextResponse.json(
        { error: `Formato inválido: ${body.format}` },
        { status: 400 }
      );
    }
    
    if (!validateTokens(body.tokens)) {
      return NextResponse.json(
        { error: 'Tokens inválidos ou incompletos' },
        { status: 400 }
      );
    }
    
    const templateKey = body.templateKey as TemplateKey;
    const format = body.format;
    const tokens = body.tokens;
    const overwrite = body.overwrite || false;
    
    // Gerar ID do certificado
    const id = generateCertificateId(tokens);
    const createdAt = new Date().toISOString();
    
    // Verificar se certificado já existe
    if (!overwrite && await certificateExists(id, createdAt)) {
      return NextResponse.json(
        { error: `Certificado já existe: ${id}` },
        { status: 409 }
      );
    }
    
    // Adquirir lock para evitar concorrência
    const lockAcquired = await acquireLock(id);
    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'Não foi possível adquirir lock para geração' },
        { status: 503 }
      );
    }
    
    try {
      // Carregar template SVG
      const templatePath = getTemplatePath(templateKey);
      const templateSvg = await fs.readFile(templatePath, 'utf8');
      
      // Extrair tokens do template
      const templateTokens = extractTokensFromSvg(templateSvg);
      
      // Verificar se todos os tokens necessários foram fornecidos
      const missingTokens = templateTokens.filter(token => !(token in tokens));
      if (missingTokens.length > 0) {
        return NextResponse.json(
          { error: `Tokens ausentes no template: ${missingTokens.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Verificar se há tokens fornecidos que não existem no template
      const extraTokens = Object.keys(tokens).filter(token => !templateTokens.includes(token));
      if (extraTokens.length > 0) {
        return NextResponse.json(
          { error: `Tokens fornecidos não existem no template: ${extraTokens.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Substituir tokens no SVG
      const finalSvg = replaceTokensInSvg(templateSvg, tokens);
      
      // Calcular hashes
      const templateSvgSha256 = calculateSha256(templateSvg);
      const finalSvgSha256 = calculateSha256(finalSvg);
      
      // Extrair dimensões e fontes
      const dimensions = extractSvgDimensions(finalSvg);
      const fonts = extractSvgFonts(finalSvg);
      
      // Criar diretórios necessários
      const filesPath = getFilesPath(id, createdAt);
      await ensureDirectoryExists(filesPath);
      
      // Salvar SVG final
      const svgPath = path.join(filesPath, 'certificate.svg');
      await fs.writeFile(svgPath, finalSvg, 'utf8');
      
      // Gerar PNG/PDF se solicitado
      let pngSha256: string | undefined;
      let pdfSha256: string | undefined;
      
      if (format === 'png' || format === 'pdf') {
        // Aqui você implementaria a conversão SVG para PNG/PDF
        // Por enquanto, vamos simular
        console.log(`Gerando ${format.toUpperCase()} para certificado ${id}`);
        
        if (format === 'png') {
          const pngPath = path.join(filesPath, 'certificate.png');
          // Implementar conversão SVG para PNG
          // const pngBuffer = await convertSvgToPng(finalSvg);
          // await fs.writeFile(pngPath, pngBuffer);
          // pngSha256 = calculateSha256(pngBuffer);
        } else if (format === 'pdf') {
          const pdfPath = path.join(filesPath, 'certificate.pdf');
          // Implementar conversão SVG para PDF
          // const pdfBuffer = await convertSvgToPdf(finalSvg);
          // await fs.writeFile(pdfPath, pdfBuffer);
          // pdfSha256 = calculateSha256(pdfBuffer);
        }
      }
      
      // Criar manifesto
      const manifest: CertificateManifest = {
        id,
        templateKey,
        tokens,
        createdAt,
        createdBy: 'system',
        hashes: {
          templateSvgSha256,
          finalSvgSha256,
          ...(pngSha256 && { pngSha256 }),
          ...(pdfSha256 && { pdfSha256 })
        },
        dimensions,
        fonts,
        engine: {
          svgToPng: 'resvg/sharp',
          svgToPdf: 'resvg/pdfkit'
        },
        version: 1
      };
      
      // Salvar manifesto
      const manifestPath = getManifestPath(id, createdAt);
      await ensureDirectoryExists(path.dirname(manifestPath));
      await writeJsonAtomic(manifestPath, manifest);
      
      // Adicionar ao índice
      const indexEntry: CertificateIndexEntry = {
        id,
        templateKey,
        createdAt,
        tokensResumo: {
          NOME_COMPLETO: tokens.NOME_COMPLETO,
          CURSO: tokens.CURSO
        },
        pathRelativo: path.relative(process.cwd(), filesPath)
      };
      
      const indexPath = getIndexPath();
      await ensureDirectoryExists(path.dirname(indexPath));
      await appendJsonlAtomic(indexPath, indexEntry);
      
      // Resposta de sucesso
      return NextResponse.json({
        id,
        templateKey,
        format,
        paths: {
          manifest: `/api/certificates/${id}/manifest`,
          file: `/api/certificates/${id}/file?format=${format}`,
          verify: `/verify/${id}`
        }
      });
      
    } finally {
      // Liberar lock
      await releaseLock(id);
    }
    
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}






