import type { PrismaClient } from '@prisma/client'
import { describe, expect, it, vi } from 'vitest'

type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0]
type MockPrismaClientInstance = { options: PrismaClientOptions }
type GlobalWithPrisma = typeof globalThis & { prisma?: unknown }

const globalForPrisma = globalThis as GlobalWithPrisma

describe('prisma singleton', () => {
  it('sets dev logging and stores prisma globally in non-production', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'development'
    const ctor = vi.fn(function PrismaClient(
      this: MockPrismaClientInstance,
      options: PrismaClientOptions,
    ) {
      this.options = options
    })
    vi.doMock('@prisma/client', () => ({ PrismaClient: ctor }))

    const mod = await import('@/lib/prisma')

    expect(ctor).toHaveBeenCalledWith({ log: ['query', 'error', 'warn'] })
    expect(globalForPrisma.prisma).toBe(mod.prisma)
  })

  it('uses production logging and does not set global in production', async () => {
    vi.resetModules()
    delete globalForPrisma.prisma
    process.env.NODE_ENV = 'production'
    const ctor = vi.fn(function PrismaClient(
      this: MockPrismaClientInstance,
      options: PrismaClientOptions,
    ) {
      this.options = options
    })
    vi.doMock('@prisma/client', () => ({ PrismaClient: ctor }))

    const mod = await import('@/lib/prisma')

    expect(ctor).toHaveBeenCalledWith({ log: ['error'] })
    expect(globalForPrisma.prisma).toBeUndefined()
    expect(mod.prisma).toBeDefined()
  })
})
