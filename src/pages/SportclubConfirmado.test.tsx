import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { afterEach, describe, expect, it } from "vitest";
import SportclubConfirmado from "./SportclubConfirmado";

const show = (state?: Record<string, unknown>) => render(
  <HelmetProvider><MemoryRouter initialEntries={[{ pathname: "/exclusivo-de-socios-sportclub-confirmado", state }]}>
    <SportclubConfirmado />
  </MemoryRouter></HelmetProvider>,
);
afterEach(() => { cleanup(); sessionStorage.clear(); });
const person = { name: "TEST CHATGPT IGNORAR", email: "test@example.com", plan: "Total" };

describe("Confirmación SportClub según equipo y plan", () => {
  it("ofrece el pack a quien necesita alquiler", () => {
    show({ ...person, alquiler: "si" });
    expect(screen.getByRole("heading", { name: "4 Clases + Alquiler" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Plan Full Socio SportClub" })).not.toBeInTheDocument();
    expect(screen.queryByAltText("Fly Free Urban")).not.toBeInTheDocument();
  });
  it("ofrece Fly Free a quien considera comprar equipo y conserva esa respuesta en WhatsApp", () => {
    show({ ...person, alquiler: "considerando" });
    expect(screen.getByAltText("Fly Free Urban")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver kit de iniciación/i })).toHaveAttribute("href", "https://lp.flyfreeurban.com/kit-de-iniciacion-adulto/");
    expect(decodeURIComponent(screen.getByRole("link", { name: "Enviar datos" }).getAttribute("href")!)).toContain("Estoy considerando comprar mi propio equipo");
    expect(screen.queryByRole("heading", { name: "4 Clases + Alquiler" })).not.toBeInTheDocument();
  });
  it("no ofrece alquiler ni kit a quien ya tiene equipo", () => {
    show({ ...person, alquiler: "no" });
    expect(screen.queryByRole("heading", { name: "4 Clases + Alquiler" })).not.toBeInTheDocument();
    expect(screen.queryByAltText("Fly Free Urban")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plan Full Socio SportClub" })).toBeInTheDocument();
  });
  it.each(["Plan Full Socio SportClub", "4 Clases + Alquiler"])("reconoce la intención de compra de %s sin darla por pagada", (planPago) => {
    show({ ...person, alquiler: "si", planPago });
    expect(screen.queryByText("Gratis")).not.toBeInTheDocument();
    expect(screen.getByText(/Tu compra todavía no está confirmada/)).toBeInTheDocument();
    expect(decodeURIComponent(screen.getByRole("link", { name: "Enviar datos" }).getAttribute("href")!)).toContain(`Quiero comprar ${planPago}`);
    expect(screen.getByRole("heading", { name: "Coordiná tu alquiler" })).toBeInTheDocument();
  });
  it("a quien compra Plan Full y necesita alquiler le destaca el pack como alternativa", () => {
    show({ ...person, alquiler: "si", planPago: "Plan Full Socio SportClub" });
    expect(screen.getByRole("heading", { name: "4 Clases + Alquiler" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comprar plan" })).toBeInTheDocument();
  });
  it("a quien ya compra el pack de alquiler no se lo vuelve a ofrecer", () => {
    show({ ...person, alquiler: "si", planPago: "4 Clases + Alquiler" });
    expect(screen.queryByRole("link", { name: "Comprar plan" })).not.toBeInTheDocument();
  });
  it("a quien compra Plan Full y ya tiene rollers (solo protecciones) no se le ofrece el pack", () => {
    show({ ...person, alquiler: "si", planPago: "Plan Full Socio SportClub", soloProtecciones: true });
    expect(screen.getByRole("heading", { name: "Coordiná tu alquiler" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "4 Clases + Alquiler" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Comprar plan" })).not.toBeInTheDocument();
  });
  it("el bloque de Fly Free en esta página usa copy propio, de asesoría", () => {
    show({ ...person, alquiler: "considerando" });
    expect(screen.getByText("Te asesoramos gratis para tu equipo")).toBeInTheDocument();
    expect(screen.queryByText("¡Invertí en tu equipo propio!")).not.toBeInTheDocument();
  });
  it("recupera la respuesta de equipo al recargar", () => {
    sessionStorage.setItem("sportclub_form", JSON.stringify({ ...person, alquiler: "considerando" }));
    show();
    expect(screen.getByAltText("Fly Free Urban")).toBeInTheDocument();
  });
  it("mantiene el flujo general sin datos y tolera un respaldo roto", () => {
    sessionStorage.setItem("sportclub_form", "{");
    show();
    expect(screen.getByText("Gratis")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enviar datos" })).toBeInTheDocument();
    expect(screen.queryByAltText("Fly Free Urban")).not.toBeInTheDocument();
  });
});
