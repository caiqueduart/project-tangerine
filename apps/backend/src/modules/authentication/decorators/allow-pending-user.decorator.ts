import { SetMetadata } from '@nestjs/common';
import { ALLOW_PENDING_USER_KEY } from '../authentication.constants';

export const AllowPendingUser = () => SetMetadata(ALLOW_PENDING_USER_KEY, true);
