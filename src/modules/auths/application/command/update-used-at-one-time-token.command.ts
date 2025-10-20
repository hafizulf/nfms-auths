export class UpdateUsedAtOneTimeTokenCommand {
  constructor(
    public readonly id: string,
    public readonly usedAt: Date,
  ) {}
}
