import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

const ReportPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <FileText className="h-8 w-8 text-teal-600 mb-4" />
          <h3 className="font-bold mb-2">Sales Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Báo cáo doanh số bán hàng theo thời gian
          </p>
          <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <TrendingUp className="h-8 w-8 text-teal-600 mb-4" />
          <h3 className="font-bold mb-2">Revenue Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Phân tích doanh thu theo sản phẩm, nhân viên
          </p>
          <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Calendar className="h-8 w-8 text-teal-600 mb-4" />
          <h3 className="font-bold mb-2">Attendance Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Báo cáo chấm công nhân viên theo tháng
          </p>
          <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </Card>
      </div>

      <Card className="p-12 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">
          Advanced reporting features are under development / Tính năng báo cáo
          nâng cao đang phát triển
        </p>
      </Card>
    </div>
  );
};

export default ReportPage;
