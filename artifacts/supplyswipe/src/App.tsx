import { lazy, Suspense, type ComponentType } from "react";
import { Router, Route, Switch, Redirect } from "wouter";
import { DemoProvider } from "@/lib/demo-context";
import { DemoPrep } from "@/components/DemoPrep";
import { AppShell } from "@/components/AppShell";

const pages = import.meta.glob<{ default: ComponentType<any> }>("./app/**/page.tsx");
const routes = Object.entries(pages)
  .filter(([file]) => file !== "./app/page.tsx")
  .map(([file, load]) => ({
    path: file.replace("./app", "").replace("/page.tsx", "").replace(/\[([^\]]+)\]/g, ":$1"),
    Page: lazy(load),
  }))
  .sort((a, b) => b.path.split("/").length - a.path.split("/").length);

export default function App() {
  return (
    <Router base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <DemoProvider>
        <DemoPrep />
        <AppShell>
          <Suspense fallback={<div className="p-6 text-muted">Loading SupplySwipe…</div>}>
            <Switch>
              <Route path="/"><Redirect to="/onboarding" /></Route>
              {routes.map(({ path, Page }) => (
                <Route key={path} path={path}>{params => <Page params={params} />}</Route>
              ))}
              <Route><div className="p-6">Page not found. <a href="/">Return to SupplySwipe</a></div></Route>
            </Switch>
          </Suspense>
        </AppShell>
      </DemoProvider>
    </Router>
  );
}
