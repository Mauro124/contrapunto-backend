import { User } from '../../domain/entities/user.entity';
import { UserDto } from '../dtos/user.dto';

export class UserMapper {
	toDomain(dto: UserDto, id: string): User {
		return {
			id,
			email: dto.email,
			credits: dto.credits ?? 0,
			createdAt: dto.createdAt ?? Date.now(),
			updatedAt: dto.updatedAt,
		};
	}

	toPersistence(entity: User): UserDto {
		return {
			email: entity.email,
			credits: entity.credits,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt ?? Date.now(),
		};
	}
}
