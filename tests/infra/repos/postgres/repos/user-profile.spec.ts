import { PgUserProfileRepository } from '@/infra/repos/postgres/repos'
import { PgUser } from '@/infra/repos/postgres/entities'
import { makeFakeDb } from '@/tests/infra/repos/postgres/mocks'
import { PgConnection } from '@/infra/repos/postgres/helpers'
import { PgRepository } from '@/infra/repos/postgres/repos/repository'

import { IBackup } from 'pg-mem'
import { Repository } from 'typeorm'

describe('PgUserProfileRepository', () => {
  let sut: PgUserProfileRepository
  let pgUserRepo: Repository<PgUser>
  let backup: IBackup
  let connection: PgConnection

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
    sut = new PgUserProfileRepository()
  })

  it('should return 403 if no authorization header is present', async () => {
    expect(sut).toBeInstanceOf(PgRepository)
  })

  describe('savePicture', () => {
    it('should update user profile', async () => {
      const { id } = await pgUserRepo.save({ email: 'any_email', initials: 'any_initials' })

      await sut.savePicture({ id: id.toString(), pictureUrl: 'any_url', initials: undefined })
      const pgUser = await pgUserRepo.findOne({ id })

      expect(pgUser).toMatchObject({ id, pictureUrl: 'any_url', initials: null })
    })
  })

  describe('load', () => {
    it('should load user profile', async () => {
      const { id } = await pgUserRepo.save({ email: 'any_email', name: 'any_name' })

      const userProfile = await sut.load({ id: id.toString() })

      expect(userProfile?.name).toBe('any_name')
    })
  })

  it('should load user profile', async () => {
    const { id } = await pgUserRepo.save({ email: 'any_email' })

    const userProfile = await sut.load({ id: id.toString() })

    expect(userProfile?.name).toBeUndefined()
  })

  describe('load', () => {
    it('should return undefined', async () => {
      const userProfile = await sut.load({ id: '1' })

      expect(userProfile).toBeUndefined()
    })
  })
})
