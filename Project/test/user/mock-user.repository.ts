import { User } from "../../src/features/user/entity/user.entity";
import { FindOperator, ObjectLiteral } from "typeorm";

const mockExecute = jest.fn((id: number) => {
    const identifiers: ObjectLiteral[] = [{ id: id }];
    const result = { identifiers: identifiers };
    return Promise.resolve(result);
});

const mockReturning = jest.fn().mockReturnValue({
    execute: mockExecute
});

const mockValues = jest.fn().mockReturnValue({
    returning: mockReturning
});

const mockInto = jest.fn().mockReturnValue({
    values: mockValues
});

const mockInsert = jest.fn().mockReturnValue({
    into: mockInto
});

const mockWhere = jest.fn().mockReturnValue({
    execute: mockExecute
});

const mockSet = jest.fn().mockReturnValue({
    where: mockWhere
});

const mockUpdate = jest.fn().mockReturnValue({
    set: mockSet
});

const mockCreateQueryBuilder = jest.fn().mockReturnValue({
    insert: mockInsert,
    update: mockUpdate
});

class MockUserRepository {
    static count = 1;

    exists = jest.fn().mockResolvedValue(true);
    findOne = jest.fn((args: { where: { id?: number, email?: string, deletedAt?: string | FindOperator<string> }, select: any }) => {
        const user = new User();
        user.id = args.where.id ?? 0;
        user.email = "abc@abc.com";
        user.name = "test";
        user.nickname = "test_nickname";
        MockUserRepository.count++;
        // 첫 요청은 정상적인 값 반환, 그다음은 undefined 반환 반복
        return MockUserRepository.count % 2 !== 0 ? user : undefined;
    });
    update = jest.fn();
    createQueryBuilder = mockCreateQueryBuilder;
}
const mockUserRepository = new MockUserRepository();
export default mockUserRepository;
