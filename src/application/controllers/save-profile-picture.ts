import { ok, HttpResponse } from '@/application/helpers'
import { Controller } from '@/application/controllers'
import { Validator, ValidationBuilder as Builder } from '@/application/validation'
import { ChangeProfilePicture } from '@/domain/use-cases'

type HttpRequest = { file?: { buffer: Buffer, mimeType: string}, userId: string }
type Model = { initials?: string, pictureUrl?: string }

export class SaveProfilePictureController extends Controller {
  constructor (private readonly changeProfilePicture: ChangeProfilePicture) {
    super()
  }

  async perform ({ file, userId }: HttpRequest): Promise<HttpResponse<Model>> {
    const { initials, pictureUrl } = await this.changeProfilePicture({ id: userId, file })
    return ok({ initials, pictureUrl })
  }

  override buildValidators ({ file }: HttpRequest): Validator[] {
    if (file === undefined) return []
    return [
      ...Builder.of({ value: file, fieldName: 'file' })
        .required()
        .image({ allowed: ['png', 'jpg'], maxSizeInMb: 5 })
        .build()
    ]
  }
}
