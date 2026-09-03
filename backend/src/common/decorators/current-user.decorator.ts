import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

// Uso: findMe(@CurrentUser() user: { userId: string; email: string }) {}
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
