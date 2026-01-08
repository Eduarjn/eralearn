import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Configuração do diretório de dados
const CERT_DATA_DIR = process.env.CERT_DATA_DIR || './data';

// Mapeamento estático de templates
const TEMPLATE_MAPPING = {
  'omni_avancado': 'Configurações Avançadas OMNI.svg',
  'pabx_avancado': 'Configurações Avançadas PABX.svg',
  'callcenter_fundamentos': 'Fundamentos CALLCENTER.svg',
  'pabx_fundamentos': 'Fundamentos de PABX.svg',
  'omnichannel_empresas': 'OMNICHANNEL para Empresas.svg'
} as const;

export type TemplateKey = keyof typeof TEMPLATE_MAPPING;

// Interfaces
export interface CertificateTokens {
  NOME_COMPLETO: string;
  CURSO: string;
  DATA_CONCLUSAO: string;
  CARGA_HORARIA: string;
  CERT_ID: string;
  QR_URL: string;
}

export interface CertificateManifest {
  id: string;
  templateKey: string;
  tokens: CertificateTokens;
  createdAt: string;
  createdBy: string;
  hashes: {
    templateSvgSha256: string;
    finalSvgSha256: string;
    pngSha256?: string;
    pdfSha256?: string;
  };
  dimensions: {
    width: number;
    height: number;
    unit: string;
  };
  fonts: string[];
  engine: {
    svgToPng: string;
    svgToPdf: string;
  };
  version: number;
}

export interface CertificateIndexEntry {
  id: string;
  templateKey: string;
  createdAt: string;
  tokensResumo: {
    NOME_COMPLETO: string;
    CURSO: string;
  };
  pathRelativo: string;
}

// Funções utilitárias
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function writeJsonAtomic(filePath: string, data: any): Promise<void> {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const jsonData = JSON.stringify(data, null, 2);
  
  try {
    await fs.writeFile(tempPath, jsonData, 'utf8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Limpar arquivo temporário em caso de erro
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw error;
  }
}

export async function appendJsonlAtomic(filePath: string, lineObject: any): Promise<void> {
  const line = JSON.stringify(lineObject) + '\n';
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  
  try {
    // Ler arquivo existente se existir
    let existingContent = '';
    try {
      existingContent = await fs.readFile(filePath, 'utf8');
    } catch {
      // Arquivo não existe, criar diretório
      await ensureDirectoryExists(path.dirname(filePath));
    }
    
    // Escrever conteúdo existente + nova linha
    await fs.writeFile(tempPath, existingContent + line, 'utf8');
    await fs.rename(tempPath, filePath);
  } catch (error) {
    // Limpar arquivo temporário em caso de erro
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw error;
  }
}

export async function acquireLock(key: string, ttlMs: number = 30000): Promise<boolean> {
  const lockPath = path.join(CERT_DATA_DIR, 'locks', `${key}.lock`);
  const lockContent = JSON.stringify({
    acquiredAt: Date.now(),
    ttl: ttlMs
  });
  
  try {
    await ensureDirectoryExists(path.dirname(lockPath));
    await fs.writeFile(lockPath, lockContent, 'utf8');
    return true;
  } catch (error) {
    // Verificar se o lock expirou
    try {
      const existingLock = await fs.readFile(lockPath, 'utf8');
      const lockData = JSON.parse(existingLock);
      
      if (Date.now() - lockData.acquiredAt > lockData.ttl) {
        // Lock expirado, remover e tentar novamente
        await fs.unlink(lockPath);
        await fs.writeFile(lockPath, lockContent, 'utf8');
        return true;
      }
    } catch {}
    
    return false;
  }
}

export async function releaseLock(key: string): Promise<void> {
  const lockPath = path.join(CERT_DATA_DIR, 'locks', `${key}.lock`);
  try {
    await fs.unlink(lockPath);
  } catch {
    // Lock não existe ou já foi removido
  }
}

export function calculateSha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function extractTokensFromSvg(svgContent: string): string[] {
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  const tokens: string[] = [];
  let match;
  
  while ((match = tokenRegex.exec(svgContent)) !== null) {
    const token = match[1].trim();
    if (!tokens.includes(token)) {
      tokens.push(token);
    }
  }
  
  return tokens;
}

export function replaceTokensInSvg(svgContent: string, tokens: Record<string, string>): string {
  let result = svgContent;
  
  for (const [key, value] of Object.entries(tokens)) {
    const tokenPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(tokenPattern, escapeXml(value));
  }
  
  return result;
}

export function getTemplatePath(templateKey: TemplateKey): string {
  const fileName = TEMPLATE_MAPPING[templateKey];
  if (!fileName) {
    throw new Error(`Template não encontrado: ${templateKey}`);
  }
  return path.join(process.cwd(), 'certificates', fileName);
}

export function getManifestPath(id: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return path.join(CERT_DATA_DIR, 'manifests', year, month, `${id}.json`);
}

export function getFilesPath(id: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return path.join(CERT_DATA_DIR, 'files', year, month, id);
}

export function getIndexPath(): string {
  return path.join(CERT_DATA_DIR, 'manifests', 'index.jsonl');
}

export function generateCertificateId(tokens?: { CERT_ID?: string }): string {
  if (tokens?.CERT_ID) {
    return tokens.CERT_ID;
  }
  return uuidv4();
}

export function extractSvgDimensions(svgContent: string): { width: number; height: number; unit: string } {
  const widthMatch = svgContent.match(/width="([^"]+)"/);
  const heightMatch = svgContent.match(/height="([^"]+)"/);
  
  const width = widthMatch ? parseFloat(widthMatch[1]) : 800;
  const height = heightMatch ? parseFloat(heightMatch[1]) : 600;
  const unit = 'px'; // Assumindo pixels por padrão
  
  return { width, height, unit };
}

export function extractSvgFonts(svgContent: string): string[] {
  const fontRegex = /font-family:\s*['"]([^'"]+)['"]/g;
  const fonts: string[] = [];
  let match;
  
  while ((match = fontRegex.exec(svgContent)) !== null) {
    const font = match[1];
    if (!fonts.includes(font)) {
      fonts.push(font);
    }
  }
  
  return fonts;
}

export async function certificateExists(id: string, createdAt: string): Promise<boolean> {
  const manifestPath = getManifestPath(id, createdAt);
  try {
    await fs.access(manifestPath);
    return true;
  } catch {
    return false;
  }
}

export function validateTemplateKey(templateKey: string): templateKey is TemplateKey {
  return templateKey in TEMPLATE_MAPPING;
}

export function validateTokens(tokens: any): tokens is CertificateTokens {
  const requiredFields = ['NOME_COMPLETO', 'CURSO', 'DATA_CONCLUSAO', 'CARGA_HORARIA', 'CERT_ID', 'QR_URL'];
  return requiredFields.every(field => 
    typeof tokens[field] === 'string' && tokens[field].trim().length > 0
  );
}

export function validateFormat(format: string): format is 'svg' | 'png' | 'pdf' {
  return ['svg', 'png', 'pdf'].includes(format);
}
















