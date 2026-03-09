/**
 * Feedback Dashboard
 * Reviews và feedback từ khách hàng
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star,
  TrendingUp,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';

const mockReviews = [
  {
    id: '1',
    customer: 'John Doe',
    rating: 5,
    comment: 'Excellent food and service! The QR ordering was very convenient.',
    date: '2024-03-08',
    sentiment: 'positive',
    replied: false,
  },
  {
    id: '2',
    customer: 'Jane Smith',
    rating: 4,
    comment: 'Good experience overall, but wait time was a bit long.',
    date: '2024-03-07',
    sentiment: 'neutral',
    replied: true,
  },
  {
    id: '3',
    customer: 'Mike Johnson',
    rating: 3,
    comment: 'Food was okay, service could be improved.',
    date: '2024-03-06',
    sentiment: 'neutral',
    replied: false,
  },
];

export default function Reviews() {
  const navigate = useNavigate();
  const [reviews] = useState(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const nps = 85;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reviews & Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Customer feedback and ratings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{avgRating}</p>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12 this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NPS Score</p>
                  <p className="text-2xl font-bold">{nps}</p>
                  <p className="text-xs text-muted-foreground">Net Promoter Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5,4,3,2,1].map(rating => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Reviews</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{review.customer}</p>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4,5].map(i => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                      {review.replied && (
                        <Badge variant="secondary" className="mt-1">Replied</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/reviews/${review.id}`)}
                  >
                    {review.replied ? 'View Reply' : 'Reply'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
