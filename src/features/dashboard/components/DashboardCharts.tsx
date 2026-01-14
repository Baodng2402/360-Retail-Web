export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Biểu đồ doanh thu</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Chart sẽ được thêm vào đây</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Biểu đồ đơn hàng</h2>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <p>Chart sẽ được thêm vào đây</p>
        </div>
      </div>
    </div>
  );
};
