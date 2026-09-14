import assert from 'node:assert';
import { getAllCategories, getAllDrinks, getDrinkBySlug } from '../src/data/coffee';
import { datedEvents, milkRows } from '../src/data/coffee/guide';
import type { DrinkCopy } from '../src/data/coffee/types';

/*
  The guide is written twice, once per language, over one set of facts. What goes wrong
  silently is drift between the two: a section added in English only, a source cited in
  one language and not the other, a related link to a page that was merged away.

  Run: npx tsx scripts/check-coffee-guide.ts
*/

const drinks = getAllDrinks();
const slugs = new Set(drinks.map(d => d.slug));

const listed = getAllCategories().flatMap(c => c.drinkSlugs);
assert.deepStrictEqual([...listed].sort(), [...slugs].sort(), 'every drink sits in exactly one category');
assert.strictEqual(new Set(listed).size, listed.length, 'no drink is listed twice');

function citations(copy: DrinkCopy): string[] {
  return [
    ...(copy.summarySources ?? []).map(id => `summary:${id}`),
    ...copy.sections.flatMap(s => s.body.flatMap((p, i) => (p.sources ?? []).map(id => `${s.id}.${i}:${id}`))),
  ];
}

for (const drink of drinks) {
  const { en, ko } = drink.content;
  const where = drink.slug;

  assert.match(drink.reviewed, /^\d{4}-\d{2}-\d{2}$/, `${where}: reviewed is a day`);
  for (const slug of drink.related) {
    assert.ok(getDrinkBySlug(slug), `${where}: related page ${slug} exists`);
    assert.notStrictEqual(slug, drink.slug, `${where}: does not list itself`);
  }

  // Same questions, same anchors, same paragraph count, same sources, in both languages.
  assert.deepStrictEqual(ko.sections.map(s => s.id), en.sections.map(s => s.id), `${where}: section anchors match`);
  assert.deepStrictEqual(citations(ko), citations(en), `${where}: the same sources back the same paragraphs`);
  assert.strictEqual(ko.facts.length, en.facts.length, `${where}: same number of facts`);
  assert.strictEqual(Boolean(ko.aka), Boolean(en.aka), `${where}: aka in both or neither`);

  for (const copy of [en, ko]) {
    for (const field of ['name', 'title', 'description', 'summary', 'line'] as const) {
      assert.ok(copy[field].trim(), `${where}: ${field} is written`);
    }
    // Search results cut descriptions around 160 characters; the summary is the full answer.
    assert.ok(copy.description.length <= 200, `${where}: description is short (${copy.description.length})`);
  }
}

// Titles and descriptions are unique per page within a language.
for (const locale of ['en', 'ko'] as const) {
  for (const field of ['title', 'description'] as const) {
    const values = drinks.map(d => d.content[locale][field]);
    assert.strictEqual(new Set(values).size, values.length, `${locale} ${field}s are unique`);
  }
}

for (const row of milkRows) assert.ok(slugs.has(row.slug), `milk table: ${row.slug} exists`);
for (const event of datedEvents) assert.ok(slugs.has(event.slug), `dates: ${event.slug} exists`);

console.log(`coffee guide: ${drinks.length} pages consistent in both languages`);
