import { describe, expect, it } from 'vitest'
import { pubsub, TASK_CREATED } from '@/lib/subpub'

describe('subpub exports', () => {
  it('exports constants and pubsub instance', () => {
    expect(TASK_CREATED).toBe('TASK_CREATED')
    expect(pubsub).toBeTruthy()
  })
})
