import JobForm from "../components/JobForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">
        AI Job Applier 🚀
      </h1>
      <JobForm />
    </div>
  );
}