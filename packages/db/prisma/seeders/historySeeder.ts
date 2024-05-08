import { faker } from "@faker-js/faker";

type History = {
  name: string;
  date: Date;
};

export function historySeeder() {
  const amountOfHistory = 10;
  const histories: History[] = [];

  for (let i = 0; i < amountOfHistory; i++) {
    const fakeDate = faker.date.between(
      "2020-01-01T00:00:00.000Z",
      "2023-01-01T00:00:00.000Z",
    );
    console.log(fakeDate, "Fecha historial");

    const history: History = {
      name: faker.commerce.department(),
      date: fakeDate,
    };

    histories.push(history);
  }

  return histories;
}
