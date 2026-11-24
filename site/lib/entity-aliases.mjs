// Explicit editorial aliases only: similarly named institutions are not merged automatically.
const aliases = new Map([['org-beijing-court', 'org-beijing-internet-court']]);

/** @param {string} id */
export const canonicalPersonId = id => aliases.get(id) ?? id;

/**
 * Preserve research records while presenting one institution and all of its events.
 * @template {{people: {id: string, name: string}[], events: {actors: string[], organizations: string[]}[]}} T
 * @param {T} data
 * @returns {T}
 */
export function normalizePeople(data) {
  const people = new Map();
  for (const person of data.people) {
    const id = canonicalPersonId(person.id);
    if (!people.has(id) || person.id === id) people.set(id, {...person, id});
  }
  return {
    ...data,
    people: [...people.values()],
    events: data.events.map(event => ({
      ...event,
      actors: [...new Set(event.actors.map(canonicalPersonId))],
      organizations: [...new Set(event.organizations.map(canonicalPersonId))],
    })),
  };
}
