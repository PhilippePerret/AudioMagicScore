import { test, expect } from "bun:test";
import { Analyzor } from "../../classes/Analyzor";
import { ContextType, NoteType } from "../../classes/Note";
import { fa, mib, sol, ut } from "../utils_tests";

/**
 * Module pour faire des tests simples, c'est-à-dire des tests de
 * situations sans complexités.
 */

test("Un accord dans une mesure est facilement détecté", () => {
  const A = new Analyzor();
  const context: ContextType = {tune: 'cm'}
  const notes: NoteType[] = [ut, mib, fa, sol];
  const res = A.analyze(notes, context);
  expect(res).toBeDefined();
});