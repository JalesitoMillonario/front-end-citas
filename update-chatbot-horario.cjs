const fs = require('fs');
const path = require('path');

// Leer el workflow del chatbot
const workflowPath = path.join(__dirname, 'n8n-workflows', 'chatbot-citas-whatsapp-completo.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Buscar el nodo "Question and Answer Chain" y actualizar el prompt
const qaNode = workflow.nodes.find(n => n.name === 'Question and Answer Chain');

if (qaNode && qaNode.parameters && qaNode.parameters.text) {
  const oldPrompt = qaNode.parameters.text;
  
  // Reemplazar la sección de HORARIO con una versión dinámica
  const updatedPrompt = oldPrompt.replace(
    /## HORARIO:\nLunes a Viernes: 10:00-20:00\nSábados: 10:00-14:00\nDomingos: Cerrado/,
    `## HORARIO:\n⚠️ **IMPORTANTE**: El horario varía según el día de la semana y está configurado en el sistema.\n**SIEMPRE debes verificar disponibilidad** usando la acción \`consulta_disponibilidad\` antes de crear una cita.\nEl sistema te dirá:\n- Qué días está CERRADO el negocio\n- Qué horas están LIBRES u OCUPADAS\n- Si hay pausas o descansos\n\nNO asumas horarios, SIEMPRE consulta primero.`
  );

  // También actualizar la sección de FLUJO PARA AGENDAR CITA
  const updatedPrompt2 = updatedPrompt.replace(
    /## FLUJO PARA AGENDAR CITA:\n\n\*\*IMPORTANTE\*\*: SIEMPRE verifica disponibilidad ANTES de crear una cita./,
    `## FLUJO PARA AGENDAR CITA:\n\n🚨 **REGLA CRÍTICA**: NUNCA crees una cita sin antes verificar disponibilidad.\nSi el día está CERRADO o la hora en PAUSA, informa al cliente y ofrece alternativas.`
  );

  // Actualizar el prompt en el nodo
  qaNode.parameters.text = updatedPrompt2;

  // Guardar el archivo actualizado
  fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf8');
  console.log('✅ Chatbot actualizado con horarios dinámicos!');
  console.log('📝 Cambios realizados:');
  console.log('  - Sección HORARIO actualizada para indicar que es dinámico');
  console.log('  - Reforzada la regla de SIEMPRE verificar disponibilidad');
  console.log('  - Agregadas instrucciones para manejar días cerrados y pausas');
} else {
  console.error('❌ No se encontró el nodo Question and Answer Chain');
}
