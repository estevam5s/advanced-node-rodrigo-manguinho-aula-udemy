import { UniqueId } from '@/infra/gateways'

import { set, reset } from 'mockdate'

describe('UniqueId', () => {
  let key: string
  let sut: UniqueId

  beforeAll(() => {
    key = 'any_key'
    set(new Date(2021, 9, 3, 10, 10, 10))
    sut = new UniqueId()
  })

  afterAll(() => {
    reset()
  })

  it('should create a unique id', () => {
    const uuid = sut.uuid({ key })

    expect(uuid).toBe('any_key_20211003101010')
  })
})
