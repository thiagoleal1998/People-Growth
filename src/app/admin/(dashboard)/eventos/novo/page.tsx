import { EventForm } from "../EventForm";

export default async function NovoEventoPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  return <EventForm defaultState={state} />;
}
