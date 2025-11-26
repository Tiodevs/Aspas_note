-- CreateTable
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrar dados existentes de avatar e bio da tabela users para profiles
-- Primeiro, criar profiles para todos os usuários que ainda não têm perfil
-- Usando uma função para gerar CUID-like IDs
INSERT INTO "profiles" ("id", "avatar", "bio", "createdAt", "updatedAt", "userId")
SELECT 
    'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24) as "id",
    u."avatar",
    u."bio",
    CURRENT_TIMESTAMP as "createdAt",
    CURRENT_TIMESTAMP as "updatedAt",
    u."id" as "userId"
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "profiles" p WHERE p."userId" = u."id"
);

-- Agora podemos remover as colunas avatar e bio da tabela users
-- (Os dados já foram migrados para a tabela profiles)
ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar";
ALTER TABLE "users" DROP COLUMN IF EXISTS "bio";

