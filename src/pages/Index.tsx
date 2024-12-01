import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Website</h1>
        <p className="text-xl text-gray-600">Your content goes here. The chat widget will appear in the bottom right corner.</p>
      </div>
      <ChatWidget />
    </div>
  );
};

export default Index;