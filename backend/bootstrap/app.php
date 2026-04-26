<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\ThrottleRequestsException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isApiRequest = fn (Request $request): bool => $request->is('api/*') || $request->expectsJson();

        $errorResponse = function (string $message, int $status, array $errors = []): JsonResponse {
            return response()->json([
                'message' => $message,
                'errors' => $errors,
            ], $status);
        };

        $exceptions->render(function (ValidationException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse(
                'The given data was invalid.',
                Response::HTTP_UNPROCESSABLE_ENTITY,
                $exception->errors(),
            );
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse('Unauthenticated.', Response::HTTP_UNAUTHORIZED);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse('Resource not found.', Response::HTTP_NOT_FOUND);
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse('Resource not found.', Response::HTTP_NOT_FOUND);
        });

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse('Too many requests.', Response::HTTP_TOO_MANY_REQUESTS);
        });

        $exceptions->render(function (HttpException $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse(
                Response::$statusTexts[$exception->getStatusCode()] ?? 'Request error.',
                $exception->getStatusCode(),
            );
        });

        $exceptions->render(function (\Throwable $exception, Request $request) use ($isApiRequest, $errorResponse): ?JsonResponse {
            if (! $isApiRequest($request)) {
                return null;
            }

            return $errorResponse('Server error.', Response::HTTP_INTERNAL_SERVER_ERROR);
        });
    })->create();
