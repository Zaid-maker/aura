"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Search,
  Filter,
  RefreshCw,
  Eye,
  TrendingUp,
  User,
  MessageSquare,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string | null;
  status: string;
  postId: string | null;
  commentId: string | null;
  reportedUserId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reporter: {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const REPORT_REASONS = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  HATE_SPEECH: "Hate Speech",
  VIOLENCE: "Violence",
  NUDITY: "Nudity",
  SELF_HARM: "Self-Harm",
  FALSE_INFORMATION: "False Information",
  BULLYING: "Bullying",
  INTELLECTUAL_PROPERTY: "Intellectual Property",
  OTHER: "Other",
};

const STATUS_COLORS = {
  PENDING: "bg-yellow-500",
  UNDER_REVIEW: "bg-blue-500",
  RESOLVED: "bg-green-500",
  DISMISSED: "bg-gray-500",
};

const STATUS_ICONS = {
  PENDING: Clock,
  UNDER_REVIEW: AlertTriangle,
  RESOLVED: CheckCircle,
  DISMISSED: XCircle,
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchReports();
      fetchStats();
    }
  }, [status, activeTab, pagination.page, selectedType]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/reports?limit=1000");
      if (response.ok) {
        const data = await response.json();
        const allReports = data.reports;
        setStats({
          total: allReports.length,
          pending: allReports.filter((r: Report) => r.status === "PENDING")
            .length,
          underReview: allReports.filter(
            (r: Report) => r.status === "UNDER_REVIEW",
          ).length,
          resolved: allReports.filter((r: Report) => r.status === "RESOLVED")
            .length,
          dismissed: allReports.filter((r: Report) => r.status === "DISMISSED")
            .length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (activeTab !== "all") {
        params.append("status", activeTab);
      }

      if (selectedType !== "all") {
        params.append("type", selectedType);
      }

      const response = await fetch(`/api/admin/reports?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination(data.pagination);
      } else if (response.status === 403) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
      } else {
        toast.error("Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(
          `Report marked as ${newStatus.toLowerCase().replace("_", " ")}`,
        );
        fetchReports();
        fetchStats();
      } else {
        toast.error("Failed to update report");
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Report deleted successfully");
        setShowDeleteDialog(false);
        setSelectedReport(null);
        fetchReports();
        fetchStats();
      } else {
        toast.error("Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    } finally {
      setActionLoading(false);
    }
  };

  const getContentLink = (report: Report) => {
    if (report.postId) {
      return `/post/${report.postId}`;
    } else if (report.commentId) {
      // You might need to fetch the post ID for the comment
      return "#";
    } else if (report.reportedUserId) {
      return `/${report.reportedUserId}`;
    }
    return "#";
  };

  const getContentTypeDisplay = (report: Report) => {
    if (report.postId) return "Post";
    if (report.commentId) return "Comment";
    if (report.reportedUserId) return "User";
    return "Unknown";
  };

  const getContentTypeIcon = (report: Report) => {
    if (report.postId) return FileText;
    if (report.commentId) return MessageSquare;
    if (report.reportedUserId) return User;
    return Flag;
  };

  const filteredReports = reports.filter((report) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.reporter.username?.toLowerCase().includes(query) ||
      report.reporter.name?.toLowerCase().includes(query) ||
      report.reason.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const StatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Flag;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Content Reports</h1>
                  <p className="text-sm text-muted-foreground">
                    Review and manage user-reported content
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchReports();
                fetchStats();
              }}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats.underReview}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.resolved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Action taken</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Dismissed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">
                {stats.dismissed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">No violation</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              {/* Search and Type Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reporter, reason, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedType === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("all")}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    All Types
                  </Button>
                  <Button
                    variant={selectedType === "POST" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("POST")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Posts
                  </Button>
                  <Button
                    variant={selectedType === "COMMENT" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("COMMENT")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </Button>
                  <Button
                    variant={selectedType === "USER" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("USER")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Users
                  </Button>
                </div>
              </div>

              {/* Status Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All
                    {activeTab === "all" && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="PENDING">
                    Pending
                    {activeTab === "PENDING" && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="UNDER_REVIEW">
                    Review
                    {activeTab === "UNDER_REVIEW" && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="RESOLVED">
                    Resolved
                    {activeTab === "RESOLVED" && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="DISMISSED">
                    Dismissed
                    {activeTab === "DISMISSED" && (
                      <Badge variant="secondary" className="ml-2">
                        {pagination.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : filteredReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No reports match your search criteria."
                    : "There are no reports matching your filters."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => {
              const ContentTypeIcon = getContentTypeIcon(report);
              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Reporter Info */}
                      <div className="flex items-start gap-3 md:w-48">
                        <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                          <AvatarImage src={report.reporter.image || ""} />
                          <AvatarFallback className="bg-purple-500/10">
                            {report.reporter.username?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {report.reporter.username || report.reporter.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reporter
                          </p>
                        </div>
                      </div>

                      {/* Report Details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-2 mb-3">
                          <Badge
                            className={
                              STATUS_COLORS[
                                report.status as keyof typeof STATUS_COLORS
                              ]
                            }
                          >
                            {StatusIcon(report.status)}
                            <span className="ml-1">
                              {report.status.replace("_", " ")}
                            </span>
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <ContentTypeIcon className="h-3 w-3" />
                            {report.type}
                          </Badge>
                          <Badge variant="secondary">
                            {
                              REPORT_REASONS[
                                report.reason as keyof typeof REPORT_REASONS
                              ]
                            }
                          </Badge>
                        </div>

                        {report.description && (
                          <div className="bg-muted/50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-muted-foreground italic">
                              "{report.description}"
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(report.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          {report.reviewedAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Reviewed{" "}
                                {formatDistanceToNow(
                                  new Date(report.reviewedAt),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 md:w-48">
                        <Link
                          href={getContentLink(report)}
                          target="_blank"
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Content
                          </Button>
                        </Link>

                        {report.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateReportStatus(report.id, "UNDER_REVIEW")
                            }
                            disabled={actionLoading}
                          >
                            Start Review
                          </Button>
                        )}

                        {report.status === "UNDER_REVIEW" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                updateReportStatus(report.id, "RESOLVED")
                              }
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateReportStatus(report.id, "DISMISSED")
                              }
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDeleteDialog(true);
                          }}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this report. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedReport && deleteReport(selectedReport.id)
                }
                className="bg-red-600 hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
