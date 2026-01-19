const fs = require('fs');
const path = require('path');

// Leer el workflow actual
const workflowPath = path.join(__dirname, 'n8n-workflows', 'sistema-citas-completo.json');
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

// 1. Agregar datos de prueba para modificar en el nodo de configuración
const configNode = workflow.nodes.find(n => n.id === 'config-datos');
if (configNode) {
  configNode.parameters.assignments.assignments.push(
    {
      "id": "9",
      "name": "fecha_actual",
      "value": "={{ $now.plus(1, 'days').toFormat('yyyy-MM-dd') }}",
      "type": "string"
    },
    {
      "id": "10",
      "name": "hora_actual",
      "value": "10:00",
      "type": "string"
    },
    {
      "id": "11",
      "name": "nueva_fecha",
      "value": "={{ $now.plus(3, 'days').toFormat('yyyy-MM-dd') }}",
      "type": "string"
    },
    {
      "id": "12",
      "name": "nueva_hora",
      "value": "14:00",
      "type": "string"
    }
  );
}

// 2. Agregar condiciones "modificar" y "servicios" al Switch
const switchNode = workflow.nodes.find(n => n.id === 'switch-accion');
if (switchNode) {
  // Agregar condición para modificar
  switchNode.parameters.rules.values.push({
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "1",
          "leftValue": "={{ $json.accion }}",
          "rightValue": "modificar",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "renameOutput": true,
    "outputKey": "modificar"
  });

  // Agregar condición para servicios
  switchNode.parameters.rules.values.push({
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "1",
          "leftValue": "={{ $json.accion }}",
          "rightValue": "servicios",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "renameOutput": true,
    "outputKey": "servicios"
  });
}

// 3. Agregar nodo HTTP Request para modificar
workflow.nodes.push({
  "parameters": {
    "method": "PUT",
    "url": "http://34.57.154.181:5000/api/n8n/citas/modificar-por-telefono",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-API-Key",
          "value": "f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"telefono\": \"{{ $json.cliente_telefono }}\",\n  \"fecha_actual\": \"{{ $json.fecha_actual }}\",\n  \"hora_actual\": \"{{ $json.hora_actual }}\",\n  \"nueva_fecha\": \"{{ $json.nueva_fecha }}\",\n  \"nueva_hora\": \"{{ $json.nueva_hora }}\",\n  \"nuevo_servicio_id\": \"{{ $json.servicio_id }}\"\n}",
    "options": {}
  },
  "id": "http-modificar",
  "name": "🔄 Modificar Cita",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [900, 800]
});

// 4. Agregar nodo de formateo para modificar
workflow.nodes.push({
  "parameters": {
    "jsCode": "// Formatear resultado de modificación\nconst data = $input.first().json;\n\nconst resultado = {\n  accion: 'modificar',\n  success: data.success,\n  cita_anterior: data.cita_anterior,\n  cita_nueva: data.cita_nueva,\n  mensaje: `🔄 CITA MODIFICADA\\n${data.message}\\n\\n📅 ANTES:\\nFecha: ${data.cita_anterior.fecha}\\nHora: ${data.cita_anterior.hora}\\nServicio: ${data.cita_anterior.servicio}\\n\\n📅 DESPUÉS:\\n👤 ${data.cita_nueva.cliente}\\n💆‍♀️ ${data.cita_nueva.servicio}\\n📅 ${data.cita_nueva.fecha} a las ${data.cita_nueva.hora}\\n💰 ${data.cita_nueva.precio}€`\n};\n\nreturn { json: resultado };"
  },
  "id": "format-modificar",
  "name": "✨ Formatear Modificar",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1120, 800]
});

// 5. Agregar nodo HTTP Request para listar servicios
workflow.nodes.push({
  "parameters": {
    "method": "GET",
    "url": "http://34.57.154.181:5000/api/n8n/servicios/listar",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-API-Key",
          "value": "f18724d47bc46ec7cac67f50633fd5508ade65b113215007e09d9c345b571788"
        }
      ]
    },
    "options": {}
  },
  "id": "http-servicios",
  "name": "🛠️ Listar Servicios",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [900, 950]
});

// 6. Agregar nodo de formateo para servicios
workflow.nodes.push({
  "parameters": {
    "jsCode": "// Formatear lista de servicios\nconst servicios = $input.all().map(item => item.json);\n\nconst porCategoria = {};\nservicios.forEach(s => {\n  const cat = s.categoria || 'Sin categoría';\n  if (!porCategoria[cat]) porCategoria[cat] = [];\n  porCategoria[cat].push(s);\n});\n\nconst activos = servicios.filter(s => s.activo === 1).length;\nconst inactivos = servicios.filter(s => s.activo === 0).length;\n\nconst resultado = {\n  accion: 'servicios',\n  total: servicios.length,\n  activos: activos,\n  inactivos: inactivos,\n  por_categoria: Object.keys(porCategoria).map(cat => ({\n    categoria: cat,\n    cantidad: porCategoria[cat].length\n  })),\n  servicios: servicios.map(s => ({\n    id: s.servicio_id,\n    nombre: s.nombre,\n    descripcion: s.descripcion,\n    duracion: `${s.duracion_minutos} min`,\n    precio: `${s.precio}€`,\n    categoria: s.categoria,\n    activo: s.activo === 1\n  })),\n  mensaje: `🛠️ SERVICIOS DISPONIBLES\\nTotal: ${servicios.length}\\n✅ Activos: ${activos}\\n❌ Inactivos: ${inactivos}\\n\\nCategorías:\\n${Object.keys(porCategoria).map(cat => `  • ${cat}: ${porCategoria[cat].length}`).join('\\n')}`\n};\n\nreturn { json: resultado };"
  },
  "id": "format-servicios",
  "name": "✨ Formatear Servicios",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [1120, 950]
});

// 7. Actualizar conexiones del Switch para incluir las salidas "modificar" y "servicios"
if (workflow.connections["🔀 Elegir Acción"]) {
  // Agregar salida para modificar
  workflow.connections["🔀 Elegir Acción"].main.push([
    {
      "node": "🔄 Modificar Cita",
      "type": "main",
      "index": 0
    }
  ]);

  // Agregar salida para servicios
  workflow.connections["🔀 Elegir Acción"].main.push([
    {
      "node": "🛠️ Listar Servicios",
      "type": "main",
      "index": 0
    }
  ]);
}

// 8. Agregar conexión de HTTP Modificar al formateador
workflow.connections["🔄 Modificar Cita"] = {
  "main": [
    [
      {
        "node": "✨ Formatear Modificar",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

// 9. Agregar conexión de HTTP Servicios al formateador
workflow.connections["🛠️ Listar Servicios"] = {
  "main": [
    [
      {
        "node": "✨ Formatear Servicios",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

// Guardar el archivo actualizado
fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf8');
console.log('✅ Workflow actualizado exitosamente!');
console.log('📝 Cambios realizados:');
console.log('  - Agregados parámetros de prueba para modificar (fecha_actual, hora_actual, nueva_fecha, nueva_hora)');
console.log('  - Agregadas condiciones "modificar" y "servicios" al Switch');
console.log('  - Agregado nodo HTTP Request para modificar cita');
console.log('  - Agregado nodo de formateo para respuesta de modificar');
console.log('  - Agregado nodo HTTP Request para listar servicios');
console.log('  - Agregado nodo de formateo para respuesta de servicios');
console.log('  - Actualizadas todas las conexiones');
console.log('\n📋 Acciones disponibles:');
console.log('  1. disponibilidad');
console.log('  2. crear');
console.log('  3. listar');
console.log('  4. cancelar');
console.log('  5. modificar (NUEVO)');
console.log('  6. servicios (NUEVO)');
