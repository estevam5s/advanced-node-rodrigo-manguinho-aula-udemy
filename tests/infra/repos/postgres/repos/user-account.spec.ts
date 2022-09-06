import { PgAccountUserRepository } from '@/infra/repos/postgres/repos'
import { PgUser } from '@/infra/repos/postgres/entities'
import { makeFakeDb } from '@/tests/infra/repos/postgres/mocks'
import { PgConnection } from '@/infra/repos/postgres/helpers'
import { PgRepository } from '@/infra/repos/postgres/repos/repository'

import { IBackup } from 'pg-mem'
import { Repository } from 'typeorm'

describe('PgUserAccountRepository', () => {
  let sut: PgAccountUserRepository
  let connection: PgConnection
  let pgUserRepo: Repository<PgUser>
  let backup: IBackup

  beforeAll(async () => {
    const db = await makeFakeDb([PgUser])
    backup = db.backup()
    connection = PgConnection.getInstance()
    pgUserRepo = connection.getRepository(PgUser)
  })

  afterAll(async () => {
    await connection.disconnect()
  })

  beforeEach(async () => {
    backup.restore()
    sut = new PgAccountUserRepository()
  })

  it('should return 403 if no authorization header is present', async () => {
    expect(sut).toBeInstanceOf(PgRepository)
  })

  describe('load', () => {
    it('should return an account if email exists', async () => {
      await pgUserRepo.save({ email: 'existing_email' })
      const acc = await sut.load({ email: 'existing_email' })

      expect(acc).toEqual({ id: '1' })
    })

    it('should return undefined if email does not exists', async () => {
      const acc = await sut.load({ email: 'new_email' })

      expect(acc).toBeUndefined()
    })
  })

  describe('saveWithFacebook', () => {
    it('should create an account if id is undefined', async () => {
      const acc = await sut.saveWithFacebook({
        name: 'any_name',
        email: 'any_email',
        facebookId: 'any_fb_id'
      })
      const pgUser = await pgUserRepo.findOne({ email: 'any_email' })

      expect(pgUser?.id).toBe(1)
      expect(acc.id).toBe('1')
    })

    it('should update account if id is defined', async () => {
      await pgUserRepo.save({
        name: 'any_name',
        email: 'any_email',
        facebookId: 'any_fb_id'
      })

      const acc = await sut.saveWithFacebook({
        id: '1',
        name: 'new_name',
        email: 'new_email',
        facebookId: 'new_fb_id'
      })
      const pgUser = await pgUserRepo.findOne({ id: 1 })

      expect(pgUser).toMatchObject({
        id: 1,
        name: 'new_name',
        email: 'any_email',
        facebookId: 'new_fb_id'
      })
      expect(acc.id).toBe('1')
    })
  })
})
