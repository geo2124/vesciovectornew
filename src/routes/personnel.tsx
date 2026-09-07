import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  Button,
  Chip,
  FieldGrid,
  Filters,
  Panel,
  Row,
  SearchField,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/kit";
import { staff } from "@/lib/mock-data";

export const Route = createFileRoute("/personnel")({
  head: () => ({
    meta: [
      { title: "Personnel — Vescio Vector" },
      {
        name: "description",
        content:
          "Staff management: managers, directors, accountants and custom positions with documents on file.",
      },
      { property: "og:title", content: "Personnel — Vescio Vector" },
      { property: "og:description", content: "Create and manage academy staff and their records." },
    ],
  }),
  component: PersonnelPage,
});

function PersonnelPage() {
  return (
    <AppShell crumb="ROSTER / PERSONNEL" title="Personnel">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Staff members" value={String(staff.length)} note="5 positions" />
        <Stat label="Branch managers" value="2" note="3 branches covered" />
        <Stat label="Documents missing" value="1" note="ID not uploaded" accent />
        <Stat label="Custom positions" value="2" note="created by admin" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel
          title="Staff database"
          meta="Search by name or phone"
          action={
            <>
              <Filters items={["Position", "Branch"]} />
              <Button>+ New staff</Button>
            </>
          }
        >
          <div className="border-b border-ink-800 px-4 py-3">
            <SearchField placeholder="Search staff by name or phone…" />
          </div>
          <Table
            head={
              <>
                <Th>NAME</Th>
                <Th>POSITION</Th>
                <Th hide>BRANCH</Th>
                <Th hide>DOB</Th>
                <Th>
                  <span className="block text-right">DOCUMENTS</span>
                </Th>
              </>
            }
            footer={`SHOWING ${staff.length} OF 9`}
          >
            {staff.map((s) => (
              <Row key={s.id}>
                <Td strong>
                  <div className="leading-tight">
                    <div>{s.name}</div>
                    <div className="font-mono text-[10px] text-ink-400">
                      {s.phone} · {s.email}
                    </div>
                  </div>
                </Td>
                <Td>
                  <Chip>{s.position.toUpperCase()}</Chip>
                </Td>
                <Td hide>{s.branch}</Td>
                <Td hide>
                  <span className="font-mono text-xs">{s.dob}</span>
                </Td>
                <Td right>
                  {s.docs ? (
                    <Chip tone="good">{s.docs} FILES</Chip>
                  ) : (
                    <Chip tone="bad">MISSING</Chip>
                  )}
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel title="New staff member">
          <FieldGrid
            fields={[
              { label: "First name" },
              { label: "Last name" },
              { label: "Date of birth" },
              { label: "Phone" },
              { label: "Email" },
              { label: "Position", hint: "or create a custom one" },
              { label: "Branch" },
              { label: "Upload ID front / back", hint: "Lebanese ID or document" },
            ]}
          />
          <div className="flex gap-2 border-t border-ink-800 px-4 py-3">
            <Button>Save staff</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
