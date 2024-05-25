"""imdb_rest URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from notifications_rest.views import AllNotification, UnreadNotificationsList, MarkAsRead
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenBlacklistView
from rest_framework_simplejwt.views import TokenRefreshView

from tournaments_app import auth_views, admin_views, views, tournamentsViews

# http://127.0.0.1:8000/api/imdb/movies
# movies

# http://127.0.0.1:8000/api/imdb/movies/3
# http://127.0.0.1:8000/api/imdb/movies/327

router = DefaultRouter()
# movies/ POST, GET(list)
# movies/<int:movie_id> # PUT/PATCH GET DELETE
# router.register(r'^movies/(?P<pk>[^/.]+)/actors', MovieActorSet)
# movies / movie_id /actors
# movies / movie_id /actors/actor_id

# movie_actor/movie_actor_id


# movies/234

urlpatterns = [

    path('auth/login', auth_views.LoginView.as_view()),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('auth/refresh', TokenRefreshView.as_view()),
    path('auth/signup', auth_views.signup),
    path('auth/me', auth_views.me),
    path('auth/users', auth_views.get_users),
    path('auth/setstaff', auth_views.set_staff),
    path('auth/update', auth_views.update_user),

    path('org/<int:organization_id>/admin/new', admin_views.create_organization_admin),
    path('tournament/<uuid:tournament_id>/admin/match_conflicts', admin_views.list_tournament_conflicts),
    path('org/<int:organization_id>/tournament/<uuid:tournament_id>/admin/new', admin_views.create_tournament_admin),

    path('org/<int:organization_id>/admin/list', admin_views.list_organization_staff),
    path('tournament/<uuid:tournament_id>/admin/list', admin_views.list_tournament_staff),

    path('tournament/<uuid:tournament_id>/delete_participant', admin_views.delete_participant),
    path('tournament/mass_register/<uuid:tournament_id>', admin_views.mass_register),
    path('tournament/mass_checkin/<uuid:tournament_id>', admin_views.mass_check_in),





    path('org/new', views.create_organization),
    path('tournament/create', tournamentsViews.create_tournament),
    path('tournament/<uuid:tournament_id>/update', tournamentsViews.update_tournament),
    path('tournaments/registered_tournaments', views.get_registered_tournaments_for_user),
    path('tournaments/<str:tournament_type>', tournamentsViews.get_tournaments),

    path('tournaments_by_org/<int:organization>/<str:tournament_type>',
         tournamentsViews.get_tournaments_by_organization),
    path('tournaments_by_org/<int:organization>', tournamentsViews.get_tournaments_by_organization),
    path('tournaments/', tournamentsViews.get_tournaments),

    path('summernote/', include('django_summernote.urls')),

    path('tournament/<uuid:tournament_id>/register', views.register_participant),
    path('tournament/<uuid:tournament_id>/max_rounds', tournamentsViews.get_max_rounds),
    path('tournament/<uuid:tournament_id>/unregister', views.unregister_participant),
    path('tournament/<uuid:tournament_id>/pool', tournamentsViews.get_tournament_pool),
    path('tournament/<uuid:tournament_id>/checkin', views.check_in_participant),
    path('tournament/<uuid:tournament_id>/start', tournamentsViews.start_tournament),
    path('tournament/<uuid:tournament_id>/end', tournamentsViews.end_tournament),

    path('tournament/<uuid:tournament_id>', tournamentsViews.get_tournament),
    path('tournament/<uuid:tournament_id>/check-registration', views.is_registered),

    path('tournament/<uuid:tournament_id>/participants', views.get_registered_participants),

    path('tournament/<uuid:tournament_id>/startround', tournamentsViews.start_round),
    path('match/<uuid:match_id>/submit', tournamentsViews.report_match_result),
    path('tournament/<uuid:tournament_id>/match/<uuid:match_id>/set_result', admin_views.set_match_result),
    path('tournament/<uuid:tournament_id>/unregister_participants', admin_views.unregister_participants),

    path('match/<uuid:match_id>', tournamentsViews.get_match),
    # path('tournament/<uuid>/details', views.tournament),
    path('tournament/<uuid:tournament_id>/pairings', tournamentsViews.get_rounds),
    path('match/<uuid:match_id>/result', tournamentsViews.get_match_result),
    # Notifications
    # path('notifications', include('notifications_rest.urls')),
    path('notifications/all', AllNotification.as_view({'get': 'list'})),
    path('notifications/unread', UnreadNotificationsList.as_view({'get': 'list'})),
    path('notifications/mark_as_read/<slug:slug>/', MarkAsRead.as_view(), name='mark_as_read'),

]

# don't do this!
# urlpatterns.append(router.urls)

urlpatterns.extend(router.urls)
