# Athena

Athena is a GitHub BI platform.

  - See users profiles
  - See users perfomance
  - And other metrics

# Why?

Manage several teams could be a hard task for a big company. With Athena it's possible to know the profile of each 
dev and team to enhance the projects performance.   

### Get Started

Select a specific metric to show the results requested


### Docker

Environment variables:

| Variable           | Description                | Default value |
|--------------------|----------------------------|---------------|
| GUNICORN_N_WORKERS | Number of gunicorn workers | 9             |
| GUNICORN_W_TIMEOUT | Timeout of gunicorn worker | 60            |
| ROUTER_URL         | Url for Athena API         |               |

