import controller from '../index';

test('sequence', () => {
    return controller.sequence([
        () => Promise.resolve(1),
        () => Promise.resolve(2),
    ]).then(result => expect(result).toStrictEqual([1,2]))
});

test('keySequence', () => {
    return controller.keySequence([1,2], (key) => Promise.resolve(key * 10))
        .then(result => expect(result).toStrictEqual([10,20]))
});