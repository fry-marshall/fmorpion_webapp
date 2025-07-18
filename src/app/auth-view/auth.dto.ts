import {
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthDto{

    @IsString()
    @IsNotEmpty({ message: 'Pseudo is required' })
    @MinLength(4, {message: 'Pseudo must contains at least 4 characters'})
    pseudo: string = ''
}