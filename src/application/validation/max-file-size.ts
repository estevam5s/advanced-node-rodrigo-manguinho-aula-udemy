import { MaxFileSizeError } from '@/application/errors'
import { Validator } from '@/application/validation'

export class MaxFileSize implements Validator {
  constructor (
    private readonly maxSizeInMb: number,
    private readonly value: Buffer
  ) {}

  validate (): Error | undefined {
    const maxFileSizInBytes = 5 * 1024 * 1024
    if (this.value.length > maxFileSizInBytes) {
      return new MaxFileSizeError(this.maxSizeInMb)
    }
  }
}
