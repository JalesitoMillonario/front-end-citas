const fs = require('fs');
const path = require('path');

// Leer el workflow de producción
const workflowPath = path.join(__dirname, 'n8n-workflows', 'sistema-citas-completo.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// Buscar el nodo "✨ Formatear Disponibilidad"
const formatNode = workflow.nodes.find(n => n.name === '✨ Formatear Disponibilidad');

if (formatNode && formatNode.parameters) {
  // Actualizar el código JavaScript para manejar días cerrados
  const newCode = `// Formatear resultado de disponibilidad
const data = $input.first().json;

// Verificar si el negocio está cerrado
if (data.cerrado === true) {
  return {
    json: {
      accion: 'disponibilidad',
      fecha: data.fecha,
      dia_semana: data.dia_semana,
      cerrado: true,
      mensaje: data.mensaje || \`🚫 CERRADO\\n\\nEl negocio está cerrado el día \${data.fecha}\\n\\n⚠️ Por favor elige otro día para tu cita.\`,
      resumen: {
        total_slots: 0,
        libres: 0,
        ocupados: 0
      },
      horarios_libres: [],
      horarios_ocupados: []
    }
  };
}

// Si está abierto, formatear normalmente
const libres = data.slots.filter(s => s.disponible);
const ocupados = data.slots.filter(s => !s.disponible);

const resultado = {
  accion: 'disponibilidad',
  fecha: data.fecha,
  dia_semana: data.dia_semana,
  cerrado: false,
  resumen: {
    total_slots: data.resumen.total_slots,
    libres: data.resumen.libres,
    ocupados: data.resumen.ocupados,
    en_pausa: data.resumen.en_pausa || 0
  },
  horarios_libres: libres.map(s => s.hora),
  horarios_ocupados: ocupados.map(s => ({
    hora: s.hora,
    cliente: s.cliente,
    servicio: s.ocupado_por,
    motivo: s.motivo || 'cita'
  })),
  mensaje: \`📅 Disponibilidad para \${data.fecha}:\\n✅ \${data.resumen.libres} slots libres\\n❌ \${data.resumen.ocupados} slots ocupados\\n⏸️ \${data.resumen.en_pausa || 0} en pausa\`
};

return { json: resultado };`;

  formatNode.parameters.jsCode = newCode;

  // Guardar el archivo actualizado
  fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf8');
  console.log('✅ Nodo de formateo actualizado!');
  console.log('📝 Cambios realizados:');
  console.log('  - Agregada validación para días cerrados (cerrado: true)');
  console.log('  - Mensaje especial cuando el negocio está cerrado');
  console.log('  - Agregado campo dia_semana y en_pausa al resultado');
  console.log('  - Agregado campo motivo para distinguir pausas de citas');
} else {
  console.error('❌ No se encontró el nodo de formateo de disponibilidad');
}
