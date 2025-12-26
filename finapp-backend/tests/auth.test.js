import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';

test('flujo completo auth + rotación refresh', { timeout: 60000 }, async () => {
  const correo = `test${Date.now()}@demo.com`;

  // Registro
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Test', correo, password: 'Secret123!' })
    .expect(201);
  assert.equal(reg.body.user.correo, correo);
  assert.ok(reg.body.accessToken);
  assert.ok(reg.body.refreshToken);
  const accessToken = reg.body.accessToken;
  const oldRefresh = reg.body.refreshToken; // guardamos el antiguo

  // Listar cápsulas públicas paginadas (estructura con data/meta)
  const capsPublic = await request(app)
    .get('/api/education/capsules?page=1&limit=5')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(200);
  assert.ok(Array.isArray(capsPublic.body.data));
  assert.ok(capsPublic.body.meta);
  assert.equal(capsPublic.body.meta.page, 1);

  // Acceso admin a listado de contenido (debe 403 si usuario no es admin)
  await request(app)
    .get('/api/admin/content')
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(403);

  // Primer refresh (debe dar nuevos tokens y rotar)
  const ref1 = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: oldRefresh })
    .expect(200);
  assert.ok(ref1.body.accessToken);
  assert.ok(ref1.body.refreshToken);
  const newRefresh = ref1.body.refreshToken;
  assert.notEqual(newRefresh, oldRefresh, 'El refresh debe rotar');

  // Usar refresh nuevo sí funciona (debe devolver otro par)
  const ref2 = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: newRefresh })
    .expect(200);
  assert.ok(ref2.body.accessToken);
  assert.ok(ref2.body.refreshToken);
  assert.notEqual(ref2.body.refreshToken, newRefresh, 'Segunda rotación genera token distinto');

  // Reusar refresh viejo debe fallar (401) y revocar el hash
  await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: oldRefresh })
    .expect(401);
});

test('cleanup cerrar conexión mongoose', async () => {
  await mongoose.connection.close();
});
