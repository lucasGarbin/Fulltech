# Supabase dos catálogos

O painel e a exibição dos catálogos usam Supabase Database, Auth e Storage. O backend Node continua responsável pelos formulários de contato e chamados técnicos.

1. No SQL Editor do projeto Supabase, execute [`setup.sql`](./setup.sql).
2. Em **Authentication > Users**, crie o usuário administrativo com e-mail e senha.
3. No SQL Editor, libere esse usuário substituindo o e-mail e executando:

   ```sql
   insert into public.catalog_admins (user_id)
   select id from auth.users where email = 'admin@seudominio.com';
   ```

4. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local` local e nas variáveis de ambiente do deploy. A publishable key pode ser usada no frontend; nunca coloque uma `service_role` key nele.
5. Reinicie o Vite. As quatro categorias iniciais são criadas pelo script SQL.

Os catálogos e PDFs que estavam no JSON/disco do backend Node não são copiados automaticamente; novos itens e arquivos passam a ser salvos no Supabase.
