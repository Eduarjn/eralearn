#!/usr/bin/env node

/**
 * Exemplo de uso do sistema de certificados
 * Demonstra como gerar certificados via API
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8080';

// Dados de exemplo para diferentes cursos
const certificateExamples = [
  {
    name: 'Certificado PABX Fundamentos',
    data: {
      templateKey: 'pabx_fundamentos',
      format: 'svg',
      tokens: {
        NOME_COMPLETO: 'João Silva Santos',
        CURSO: 'Fundamentos de PABX',
        DATA_CONCLUSAO: '2025-01-09',
        CARGA_HORARIA: '8h',
        CERT_ID: 'FUP-2025-000001',
        QR_URL: 'https://meudominio.com/verify/FUP-2025-000001'
      },
      overwrite: false
    }
  },
  {
    name: 'Certificado CALLCENTER',
    data: {
      templateKey: 'callcenter_fundamentos',
      format: 'svg',
      tokens: {
        NOME_COMPLETO: 'Maria Oliveira Costa',
        CURSO: 'Fundamentos CALLCENTER',
        DATA_CONCLUSAO: '2025-01-09',
        CARGA_HORARIA: '6h',
        CERT_ID: 'FCC-2025-000001',
        QR_URL: 'https://meudominio.com/verify/FCC-2025-000001'
      },
      overwrite: false
    }
  },
  {
    name: 'Certificado OMNICHANNEL',
    data: {
      templateKey: 'omnichannel_empresas',
      format: 'svg',
      tokens: {
        NOME_COMPLETO: 'Pedro Almeida Lima',
        CURSO: 'OMNICHANNEL para Empresas',
        DATA_CONCLUSAO: '2025-01-09',
        CARGA_HORARIA: '12h',
        CERT_ID: 'OEM-2025-000001',
        QR_URL: 'https://meudominio.com/verify/OEM-2025-000001'
      },
      overwrite: false
    }
  }
];

async function generateCertificate(certificateData) {
  try {
    console.log(`\n🎓 Gerando: ${certificateData.name}`);
    console.log(`   Template: ${certificateData.data.templateKey}`);
    console.log(`   Aluno: ${certificateData.data.tokens.NOME_COMPLETO}`);
    
    const response = await fetch(`${BASE_URL}/api/certificates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(certificateData.data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Sucesso! ID: ${result.id}`);
      console.log(`   📄 Manifesto: ${result.paths.manifest}`);
      console.log(`   📁 Arquivo: ${result.paths.file}`);
      console.log(`   🔍 Verificação: ${result.paths.verify}`);
      return result;
    } else {
      console.log(`   ❌ Erro: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
    return null;
  }
}

async function listTemplates() {
  try {
    console.log('\n📋 Listando templates disponíveis...');
    
    const response = await fetch(`${BASE_URL}/api/certificates/templates`);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`   Total de templates: ${result.total}`);
      result.templates.forEach(template => {
        console.log(`   📄 ${template.key}: ${template.name}`);
        console.log(`      Tokens: ${template.tokens.join(', ')}`);
        console.log(`      Dimensões: ${template.dimensions.width}×${template.dimensions.height}px`);
      });
    } else {
      console.log(`   ❌ Erro: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

async function getCertificateManifest(certificateId) {
  try {
    console.log(`\n📋 Buscando manifesto do certificado: ${certificateId}`);
    
    const response = await fetch(`${BASE_URL}/api/certificates/${certificateId}/manifest`);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Manifesto encontrado`);
      console.log(`   📅 Criado em: ${result.createdAt}`);
      console.log(`   👤 Criado por: ${result.createdBy}`);
      console.log(`   🎨 Template: ${result.templateKey}`);
      console.log(`   📏 Dimensões: ${result.dimensions.width}×${result.dimensions.height}px`);
      console.log(`   🔐 Hash SVG: ${result.hashes.finalSvgSha256.substring(0, 16)}...`);
      return result;
    } else {
      console.log(`   ❌ Erro: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
    return null;
  }
}

async function downloadCertificate(certificateId, format = 'svg') {
  try {
    console.log(`\n📥 Baixando certificado: ${certificateId} (${format})`);
    
    const response = await fetch(`${BASE_URL}/api/certificates/${certificateId}/file?format=${format}`);
    
    if (response.ok) {
      const buffer = await response.buffer();
      console.log(`   ✅ Download concluído`);
      console.log(`   📊 Tamanho: ${buffer.length} bytes`);
      console.log(`   📄 Content-Type: ${response.headers.get('content-type')}`);
      return buffer;
    } else {
      const result = await response.json();
      console.log(`   ❌ Erro: ${result.error}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
    return null;
  }
}

async function testIdempotency() {
  console.log('\n🔄 Testando idempotência...');
  
  const testData = {
    templateKey: 'pabx_fundamentos',
    format: 'svg',
    tokens: {
      NOME_COMPLETO: 'Teste Idempotência',
      CURSO: 'Fundamentos de PABX',
      DATA_CONCLUSAO: '2025-01-09',
      CARGA_HORARIA: '8h',
      CERT_ID: 'IDEM-2025-000001',
      QR_URL: 'https://meudominio.com/verify/IDEM-2025-000001'
    },
    overwrite: false
  };
  
  // Primeira geração
  console.log('   🎯 Primeira geração...');
  const firstResult = await generateCertificate({ name: 'Teste Idempotência', data: testData });
  
  if (firstResult) {
    // Segunda geração (deve falhar)
    console.log('   🎯 Segunda geração (deve falhar)...');
    const secondResult = await generateCertificate({ name: 'Teste Idempotência', data: testData });
    
    if (!secondResult) {
      console.log('   ✅ Idempotência funcionando corretamente!');
    } else {
      console.log('   ❌ Idempotência não funcionou - segunda geração deveria falhar');
    }
  }
}

async function runExamples() {
  console.log('🚀 Exemplos de uso do sistema de certificados ERA Learn\n');
  
  try {
    // Listar templates
    await listTemplates();
    
    // Gerar certificados de exemplo
    const generatedCertificates = [];
    for (const example of certificateExamples) {
      const result = await generateCertificate(example);
      if (result) {
        generatedCertificates.push(result);
      }
    }
    
    // Testar idempotência
    await testIdempotency();
    
    // Buscar manifestos dos certificados gerados
    for (const cert of generatedCertificates) {
      await getCertificateManifest(cert.id);
    }
    
    // Baixar um certificado como exemplo
    if (generatedCertificates.length > 0) {
      await downloadCertificate(generatedCertificates[0].id, 'svg');
    }
    
    console.log('\n✅ Exemplos concluídos com sucesso!');
    console.log('\n📚 Para mais informações, consulte: CERTIFICATE_SYSTEM_README.md');
    
  } catch (error) {
    console.error('\n❌ Erro durante os exemplos:', error);
  }
}

// Executar se o script for chamado diretamente
if (require.main === module) {
  runExamples();
}

module.exports = {
  generateCertificate,
  listTemplates,
  getCertificateManifest,
  downloadCertificate,
  testIdempotency,
  runExamples
};






