
let uuidQueue: string[] = [];

export function getUuid() {
    if (uuidQueue.length === 0) {
        throw Error("Mock UUID queue depleted");
    }

    return uuidQueue.shift();
}

export function clearUuids() {
    uuidQueue = [];
}

export function enqueueUuid(...ids: string[]) {
    for (const id of ids) {
        uuidQueue.push(id);
    }
}

interface DateMock {
    (): Date;
    setDate(d: Date): void;
}

let mockDateValue: Date = new Date();

const RealDate = Date;

export function getDate(): Date {

    if (arguments.length === 0) {
        return Function.prototype.apply(RealDate, arguments);
    }

    return mockDateValue;
}

export function setDate(d: Date) {
    mockDateValue = d;
}
