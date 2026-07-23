# 🖥️ Paqueteria Client

Frontend del **Sistema de Control de Paquetería**. Aplicación web construida con
React, Vite y TypeScript que permite a los almaceneros y administradores gestionar
todo el flujo de paquetes de manera intuitiva.

## ✨ Funcionalidades principales

- ✅ Carga de guías mediante archivo Excel (parseado localmente en el navegador).
- ✅ Vista previa de los datos extraídos por IA, con tabla editable para correcciones.
- ✅ Confirmación de guías y envío al backend para almacenamiento.
- ✅ Subida de archivos de recepción (escaneos) y visualización de informes de
  faltantes y huérfanos.
- ✅ Listado de paquetes con filtros por HBL, destinatario, provincia, estado.
- ✅ Panel de administración de destinatarios, provincias, ubicaciones y estados.
- ✅ Gestión de usuarios (solo administradores).
- ✅ Cambio manual de estado y ubicación de cualquier paquete.
- ✅ Exportación de hojas de ruta para choferes.

## 🧱 Stack

- [React](https://react.dev) con [Vite](https://vitejs.dev)
- TypeScript
- [Axios](https://axios-http.com) para llamadas a la API
- [SheetJS (xlsx)](https://sheetjs.com) para parseo de Excel en el frontend

## 🚀 Ejecución local

\`\`\`bash
git clone https://github.com/tuusuario/paqueteria-client.git
cd paqueteria-client
pnpm install
pnpm dev
\`\`\`

La aplicación estará disponible en `http://localhost:5173` y espera que el backend
esté corriendo en `http://localhost:3000`. La URL de la API se configura en el
archivo `.env` (`VITE_API_URL`).

## 🌐 Integración con el servidor

El flujo completo de subida de guías funciona así:

1. El usuario elige un archivo `.xlsx`.
2. El frontend lo convierte en un array de strings (celdas separadas por `|`).
3. Se envía al endpoint `POST /guides/upload` y se recibe la vista previa con los
   datos estructurados.
4. El usuario revisa, corrige y confirma mediante `POST /guides/confirm`.

Para más detalles, consulta el [repositorio del servidor](https://github.com/tuusuario/paqueteria-server).

## 📄 Licencia

Misma licencia restrictiva que el backend: solo para evaluación profesional.  
Ver [LICENSE](LICENSE).

## 📬 Contacto

**Osmel Medero Rosales**  
Email: [osmelmr.dev@gmail.com](mailto:osmelmr.dev@gmail.com)  
Teléfono: +53 63967194

---

© 2026 Osmel Medero Rosales – Todos los derechos reservados.
