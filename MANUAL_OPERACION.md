# 🔧 Manual de Operación del Servidor Web

## 🚀 Guía de Inicio Rápido

### Paso 1: Preparación del Entorno

```bash
# Verificar requisitos del sistema
node --version    # Debe ser >= 16.0.0
npm --version     # Debe estar instalado

# Clonar el repositorio
git clone https://github.com/efrenbohorquez/SERVIDORWEB.git
cd SERVIDORWEB

# Instalar dependencias
npm install
```

### Paso 2: Configuración

```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar configuraciones (opcional)
# Modificar puerto, JWT secret, etc.
```

### Paso 3: Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start

# Con debug
DEBUG=* npm start
```

## 📋 Comandos de Operación

### Gestión del Servidor

```bash
# Iniciar servidor en background
nohup npm start > server.log 2>&1 &

# Ver procesos Node.js activos
ps aux | grep node

# Detener servidor (por PID)
kill -TERM <PID>

# Reinicio graceful
kill -USR2 <PID>
```

### Con PM2 (Recomendado para Producción)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start src/server.js --name "servidor-web"

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs servidor-web

# Reiniciar
pm2 restart servidor-web

# Detener
pm2 stop servidor-web

# Eliminar del PM2
pm2 delete servidor-web

# Guardar configuración PM2
pm2 save
pm2 startup
```

## 🔍 Monitoreo y Diagnóstico

### Verificación de Salud del Servidor

```bash
# Test básico de conectividad
curl http://localhost:3001

# Test con información detallada
curl -v http://localhost:3001

# Test de autenticación
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Monitoreo de Logs

```bash
# Ver logs en tiempo real
tail -f logs/combined.log

# Filtrar solo errores
tail -f logs/error.log

# Buscar errores específicos
grep "Error" logs/combined.log

# Ver últimas 100 líneas
tail -n 100 logs/combined.log

# Logs por fecha
grep "2025-06-22" logs/combined.log
```

### Métricas del Sistema

```bash
# Uso de memoria del proceso Node.js
ps -p <PID> -o pid,ppid,cmd,%mem,%cpu

# Conexiones de red activas
netstat -an | grep 3001

# Espacio en disco (logs y uploads)
du -sh logs/ uploads/

# Procesos que consumen más CPU
top -p <PID>
```

## 🔧 Tareas de Mantenimiento

### Rotación de Logs

```bash
# Manual - comprimir logs antiguos
cd logs/
gzip combined.log.1 error.log.1

# Limpiar logs antiguos (más de 30 días)
find logs/ -name "*.log.*" -mtime +30 -delete

# Script de rotación
#!/bin/bash
DATE=$(date +%Y%m%d)
mv logs/combined.log logs/combined.log.$DATE
mv logs/error.log logs/error.log.$DATE
kill -USR1 <PID>  # Reabrir archivos de log
```

### Limpieza de Archivos Subidos

```bash
# Ver espacio usado por uploads
du -sh uploads/

# Listar archivos por tamaño
ls -lah uploads/ | sort -k5 -h

# Eliminar archivos más antiguos de 90 días
find uploads/ -type f -mtime +90 -delete

# Backup de archivos importantes
tar -czf backup_uploads_$(date +%Y%m%d).tar.gz uploads/
```

### Actualización del Sistema

```bash
# Backup completo antes de actualizar
cp -r SERVIDORWEB SERVIDORWEB_backup_$(date +%Y%m%d)

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix

# Test después de actualización
npm test
```

## 🚨 Procedimientos de Emergencia

### Servidor No Responde

1. **Verificar si está ejecutándose:**
   ```bash
   ps aux | grep node
   curl http://localhost:3001
   ```

2. **Revisar logs de error:**
   ```bash
   tail -n 50 logs/error.log
   ```

3. **Reiniciar el servidor:**
   ```bash
   # Con PM2
   pm2 restart servidor-web
   
   # Manual
   kill <PID>
   npm start
   ```

### Error de Memoria

1. **Verificar uso de memoria:**
   ```bash
   ps -p <PID> -o pid,ppid,cmd,%mem,%cpu
   ```

2. **Reiniciar con más memoria:**
   ```bash
   node --max-old-space-size=4096 src/server.js
   ```

3. **Análisis de memory leaks:**
   ```bash
   DEBUG=* npm start > debug.log 2>&1
   grep -i "memory\|heap" debug.log
   ```

### Puerto Ocupado

1. **Identificar proceso:**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   
   # Linux/Mac
   lsof -ti:3001
   ```

2. **Terminar proceso:**
   ```bash
   # Windows
   taskkill /PID <PID> /F
   
   # Linux/Mac
   kill -9 <PID>
   ```

3. **Cambiar puerto:**
   ```bash
   # Editar .env
   PORT=3002
   ```

## 📊 Métricas y Alertas

### KPIs Importantes

1. **Disponibilidad del Servidor:**
   - Target: 99.9% uptime
   - Medición: Health checks cada 5 minutos

2. **Tiempo de Respuesta:**
   - Target: < 200ms para endpoints simples
   - Target: < 1s para uploads de archivos

3. **Errores HTTP:**
   - Target: < 1% de requests con error 5xx
   - Monitoreo: Logs de error en tiempo real

4. **Uso de Recursos:**
   - CPU: < 70% promedio
   - Memoria: < 80% del disponible
   - Disco: < 80% del disponible

### Scripts de Monitoreo

**Health Check Script:**
```bash
#!/bin/bash
# health_check.sh

URL="http://localhost:3001"
TIMEOUT=10

if curl -f -s --max-time $TIMEOUT $URL > /dev/null; then
    echo "$(date): Servidor OK"
    exit 0
else
    echo "$(date): Servidor DOWN - Enviando alerta"
    # Aquí agregar notificación (email, Slack, etc.)
    exit 1
fi
```

**Resource Monitor:**
```bash
#!/bin/bash
# monitor_resources.sh

PID=$(pgrep -f "node.*server.js")
if [ -z "$PID" ]; then
    echo "$(date): Proceso no encontrado"
    exit 1
fi

# Obtener métricas
CPU=$(ps -p $PID -o %cpu= | xargs)
MEM=$(ps -p $PID -o %mem= | xargs)
DISK=$(df -h logs/ | awk 'NR==2 {print $5}' | sed 's/%//')

echo "$(date): CPU: ${CPU}%, MEM: ${MEM}%, DISK: ${DISK}%"

# Alertas
if (( $(echo "$CPU > 80" | bc -l) )); then
    echo "ALERTA: CPU alto: ${CPU}%"
fi

if (( $(echo "$MEM > 80" | bc -l) )); then
    echo "ALERTA: Memoria alta: ${MEM}%"
fi

if [ "$DISK" -gt 80 ]; then
    echo "ALERTA: Disco lleno: ${DISK}%"
fi
```

## 🔄 Procedimientos de Backup

### Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/servidor-web"
SOURCE_DIR="/path/to/SERVIDORWEB"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de código fuente (sin node_modules)
tar --exclude='node_modules' --exclude='logs' \
    -czf $BACKUP_DIR/source_$DATE.tar.gz $SOURCE_DIR

# Backup de uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $SOURCE_DIR/uploads/

# Backup de configuración
cp $SOURCE_DIR/.env $BACKUP_DIR/env_$DATE

# Backup de logs (últimos 7 días)
find $SOURCE_DIR/logs/ -name "*.log" -mtime -7 \
    -exec tar -czf $BACKUP_DIR/logs_$DATE.tar.gz {} +

# Limpiar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

### Restauración

```bash
#!/bin/bash
# restore.sh

BACKUP_DATE=$1
BACKUP_DIR="/backup/servidor-web"
RESTORE_DIR="/restore/servidor-web-$BACKUP_DATE"

if [ -z "$BACKUP_DATE" ]; then
    echo "Uso: ./restore.sh YYYYMMDD_HHMMSS"
    exit 1
fi

# Crear directorio de restauración
mkdir -p $RESTORE_DIR

# Restaurar código fuente
tar -xzf $BACKUP_DIR/source_$BACKUP_DATE.tar.gz -C $RESTORE_DIR

# Restaurar uploads
tar -xzf $BACKUP_DIR/uploads_$BACKUP_DATE.tar.gz -C $RESTORE_DIR

# Restaurar configuración
cp $BACKUP_DIR/env_$BACKUP_DATE $RESTORE_DIR/.env

# Instalar dependencias
cd $RESTORE_DIR
npm install

echo "Restauración completada en: $RESTORE_DIR"
```

## 🛡️ Seguridad Operacional

### Hardening del Servidor

1. **Firewall:**
   ```bash
   # Permitir solo puerto necesario
   ufw allow 3001/tcp
   ufw enable
   ```

2. **Usuario dedicado:**
   ```bash
   # Crear usuario para la aplicación
   useradd -r -s /bin/false servidor-web
   chown -R servidor-web:servidor-web /path/to/SERVIDORWEB
   ```

3. **Límites de proceso:**
   ```bash
   # /etc/security/limits.conf
   servidor-web soft nofile 65536
   servidor-web hard nofile 65536
   servidor-web soft nproc 4096
   servidor-web hard nproc 4096
   ```

### Monitoreo de Seguridad

```bash
# Verificar intentos de login fallidos
grep "401 Unauthorized" logs/combined.log | tail -20

# Monitorear archivos subidos sospechosos
find uploads/ -name "*.php" -o -name "*.exe" -o -name "*.sh"

# Verificar tamaño inusual de archivos
find uploads/ -size +50M -ls

# Monitorear requests anómalos
grep -E "(DROP|SELECT|INSERT|UPDATE|DELETE)" logs/combined.log
```

Este manual proporciona todos los procedimientos operacionales necesarios para mantener el servidor web funcionando de manera óptima y segura.
