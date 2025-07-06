function Footer() {
  return (
    <footer className="bg-white shadow-inner py-4 mt-10">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Notes App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 